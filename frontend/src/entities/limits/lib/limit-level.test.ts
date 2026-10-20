import { describe, expect, it } from "vitest";
import type { ILimitStatus } from "@preduzetnik/shared";
import { getLimitLevel } from "./limit-level";

const status = (percentage: number, isExceeded = false): ILimitStatus => ({
  limit: 6_000_000,
  current: (6_000_000 * percentage) / 100,
  remaining: Math.max(0, 6_000_000 * (1 - percentage / 100)),
  percentage,
  isExceeded,
});

describe("getLimitLevel", () => {
  it.each([
    [0, "ok"],
    [79.99, "ok"],
    [80, "warning"],
    [94.9, "warning"],
    [95, "danger"],
  ] as const)("%s%% is %s", (percentage, level) => {
    expect(getLimitLevel(status(percentage))).toBe(level);
  });

  it("is danger when the limit is exceeded", () => {
    expect(getLimitLevel(status(100.5, true))).toBe("danger");
  });
});
