import { describe, expect, it } from "vitest";

import { comboBonus, nextCombo } from "@/lib/game/combo";

describe("nextCombo", () => {
  it("PERFECT 판정은 콤보를 1 증가시킨다", () => {
    expect(nextCombo(2, "PERFECT")).toBe(3);
  });

  it("GOOD 판정은 콤보를 그대로 유지한다", () => {
    expect(nextCombo(2, "GOOD")).toBe(2);
  });

  it("EARLY 판정은 콤보를 0으로 초기화한다", () => {
    expect(nextCombo(5, "EARLY")).toBe(0);
  });

  it("LATE 판정은 콤보를 0으로 초기화한다", () => {
    expect(nextCombo(5, "LATE")).toBe(0);
  });

  it("BURNT는 콤보를 0으로 초기화한다", () => {
    expect(nextCombo(5, "BURNT")).toBe(0);
  });
});

describe("comboBonus", () => {
  it("콤보 수치에 비례한 보너스 금액을 계산한다", () => {
    expect(comboBonus(3)).toBe(300);
  });

  it("콤보가 0이면 보너스도 0이다", () => {
    expect(comboBonus(0)).toBe(0);
  });
});
