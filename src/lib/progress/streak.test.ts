import { describe, expect, it } from "vitest";
import { currentStreak } from "./store";

function iso(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

describe("currentStreak", () => {
  it("is zero when idle for more than a day", () => {
    expect(currentStreak([iso(-5)])).toBe(0);
  });

  it("counts consecutive days ending today or yesterday", () => {
    expect(currentStreak([iso(0), iso(-1), iso(-2)])).toBe(3);
    expect(currentStreak([iso(-1), iso(-2)])).toBe(2);
  });
});
