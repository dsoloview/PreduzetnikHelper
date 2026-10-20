import { beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";

const setup = async (respond: (config: InternalAxiosRequestConfig) => Promise<unknown>) => {
  vi.resetModules();
  const { apiClient } = await import("@/shared/api/api.client");
  const { useAuthStore } = await import("./auth.store");
  const { restoreSession } = await import("./session");
  const adapter = vi.fn(respond);
  apiClient.defaults.adapter = adapter as unknown as AxiosAdapter;
  return { useAuthStore, restoreSession, adapter };
};

describe("restoreSession", () => {
  beforeEach(() => localStorage.clear());

  it("starts unknown and becomes authenticated when the refresh cookie is valid", async () => {
    const { useAuthStore, restoreSession } = await setup((config) =>
      Promise.resolve({ data: { accessToken: "fresh" }, status: 200, statusText: "OK", headers: {}, config }),
    );
    expect(useAuthStore.getState().status).toBe("unknown");

    await restoreSession();

    expect(useAuthStore.getState()).toMatchObject({ status: "authenticated", accessToken: "fresh" });
  });

  it("becomes anonymous when there is no valid refresh cookie", async () => {
    const { useAuthStore, restoreSession } = await setup((config) =>
      Promise.reject(new AxiosError("401", "ERR_BAD_REQUEST", config, null, { data: {}, status: 401, statusText: "", headers: {}, config })),
    );

    await restoreSession();

    expect(useAuthStore.getState()).toMatchObject({ status: "anonymous", accessToken: null });
  });

  it("sends a single request for concurrent callers", async () => {
    const { restoreSession, adapter } = await setup((config) =>
      Promise.resolve({ data: { accessToken: "fresh" }, status: 200, statusText: "OK", headers: {}, config }),
    );

    await Promise.all([restoreSession(), restoreSession(), restoreSession()]);

    expect(adapter).toHaveBeenCalledTimes(1);
  });
});
