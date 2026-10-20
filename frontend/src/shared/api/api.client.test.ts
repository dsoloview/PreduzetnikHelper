import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";

type Handler = (config: InternalAxiosRequestConfig) => Promise<unknown>;

const response = (config: InternalAxiosRequestConfig, status: number, data: unknown = {}) => ({
  data,
  status,
  statusText: String(status),
  headers: {},
  config,
});

const fail = (config: InternalAxiosRequestConfig, status: number) =>
  Promise.reject(new AxiosError(`HTTP ${status}`, "ERR_BAD_REQUEST", config, null, response(config, status)));

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

/** Fresh module state per test: the interceptor keeps its refresh queue at module level */
const setup = async (handler: Handler) => {
  vi.resetModules();
  const { apiClient } = await import("./api.client");
  const { useAuthStore } = await import("@/entities/user/model/auth.store");
  useAuthStore.getState().setToken("expired-token");
  const calls: string[] = [];
  apiClient.defaults.adapter = ((config: InternalAxiosRequestConfig) => {
    calls.push(`${config.method?.toUpperCase()} ${config.url} ${config.headers.Authorization ?? ""}`.trim());
    return handler(config);
  }) as AxiosAdapter;
  return { apiClient, useAuthStore, calls };
};

/** Resolves with "pending" if the promise has not settled after the queue drains */
const settleState = async (promise: Promise<unknown>) =>
  Promise.race([promise.then(() => "resolved", () => "rejected"), new Promise((r) => setTimeout(() => r("pending"), 50))]);

describe("apiClient token refresh", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("refreshes an expired token once and retries the request", async () => {
    const { apiClient, useAuthStore, calls } = await setup((config) => {
      if (config.url === "/auth/refresh") return Promise.resolve(response(config, 200, { accessToken: "new-token" }));
      return config.headers.Authorization === "Bearer new-token"
        ? Promise.resolve(response(config, 200, ["client"]))
        : fail(config, 401);
    });

    const result = await apiClient.get("/clients");

    expect(result.data).toEqual(["client"]);
    expect(useAuthStore.getState().accessToken).toBe("new-token");
    expect(calls).toEqual(["GET /clients Bearer expired-token", "POST /auth/refresh Bearer expired-token", "GET /clients Bearer new-token"]);
  });

  it("queues requests that fail while a refresh is in flight and retries them with the new token", async () => {
    const refresh = deferred<unknown>();
    const { apiClient, calls } = await setup((config) => {
      if (config.url === "/auth/refresh") return refresh.promise;
      return config.headers.Authorization === "Bearer new-token" ? Promise.resolve(response(config, 200, config.url)) : fail(config, 401);
    });

    const first = apiClient.get("/clients");
    const second = apiClient.get("/invoices");
    await vi.waitFor(() => expect(calls.filter((c) => c.startsWith("POST /auth/refresh"))).toHaveLength(1));
    refresh.resolve({ data: { accessToken: "new-token" }, status: 200, statusText: "OK", headers: {}, config: {} });

    expect((await first).data).toBe("/clients");
    expect((await second).data).toBe("/invoices");
    expect(calls.filter((c) => c.startsWith("POST /auth/refresh"))).toHaveLength(1);
  });

  it("rejects every waiting request when the refresh fails, instead of leaving them pending", async () => {
    const refresh = deferred<unknown>();
    const { apiClient, useAuthStore } = await setup((config) => (config.url === "/auth/refresh" ? refresh.promise : fail(config, 401)));
    const onUnauthorized = vi.fn();
    window.addEventListener("auth:unauthorized", onUnauthorized);

    const first = apiClient.get("/clients");
    const second = apiClient.get("/invoices");
    await new Promise((r) => setTimeout(r, 0));
    refresh.reject(new AxiosError("expired", "ERR_BAD_REQUEST"));

    expect(await settleState(first)).toBe("rejected");
    expect(await settleState(second)).toBe("rejected");
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    window.removeEventListener("auth:unauthorized", onUnauthorized);
  });

  it("does not try to refresh on a 401 from login", async () => {
    const { apiClient, calls } = await setup((config) => fail(config, 401));

    await expect(apiClient.post("/auth/login", {})).rejects.toBeInstanceOf(AxiosError);
    expect(calls).toEqual(["POST /auth/login Bearer expired-token"]);
  });
});
