import { describe, expect, it } from "vitest";

import { getDifficultyBand } from "@/lib/game/difficulty";
import { DEFAULT_TIMING } from "@/lib/game/tray-state";

describe("getDifficultyBand", () => {
  it("0~20초 구간에서는 기본 조리 시간과 주문 수량 1~2개 범위를 반환한다", () => {
    const band = getDifficultyBand(0);

    expect(band.timing.cookingMs).toBe(DEFAULT_TIMING.cookingMs);
    expect(band.minOrderQuantity).toBe(1);
    expect(band.maxOrderQuantity).toBe(2);
  });

  it("19초는 여전히 0~20초 구간이다", () => {
    const band = getDifficultyBand(19);

    expect(band.minOrderQuantity).toBe(1);
    expect(band.maxOrderQuantity).toBe(2);
  });

  it("20~40초 구간에서는 조리 시간이 짧아지고 주문 수량 2~3개 범위를 반환한다", () => {
    const band = getDifficultyBand(20);

    expect(band.timing.cookingMs).toBeLessThan(DEFAULT_TIMING.cookingMs);
    expect(band.minOrderQuantity).toBe(2);
    expect(band.maxOrderQuantity).toBe(3);
  });

  it("39초는 여전히 20~40초 구간이다", () => {
    const band = getDifficultyBand(39);

    expect(band.minOrderQuantity).toBe(2);
    expect(band.maxOrderQuantity).toBe(3);
  });

  it("40~60초 구간에서는 조리 시간이 더 짧아지고 주문 수량 2~4개 범위를 반환한다", () => {
    const early = getDifficultyBand(0);
    const mid = getDifficultyBand(20);
    const late = getDifficultyBand(40);

    expect(late.timing.cookingMs).toBeLessThan(mid.timing.cookingMs);
    expect(late.timing.cookingMs).toBeLessThan(early.timing.cookingMs);
    expect(late.minOrderQuantity).toBe(2);
    expect(late.maxOrderQuantity).toBe(4);
  });

  it("59초는 여전히 40~60초 구간이다", () => {
    const band = getDifficultyBand(59);

    expect(band.minOrderQuantity).toBe(2);
    expect(band.maxOrderQuantity).toBe(4);
  });
});
