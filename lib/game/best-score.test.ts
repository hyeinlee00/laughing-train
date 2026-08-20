import { beforeEach, describe, expect, it } from "vitest";

import { loadBestScore, saveBestScoreIfHigher } from "@/lib/game/best-score";

beforeEach(() => {
  window.localStorage.clear();
});

describe("loadBestScore", () => {
  it("저장된 기록이 없으면 0을 반환한다", () => {
    expect(loadBestScore()).toBe(0);
  });
});

describe("saveBestScoreIfHigher", () => {
  it("새 점수가 이전 기록보다 높으면 저장하고 그 점수를 반환한다", () => {
    const result = saveBestScoreIfHigher(5000);

    expect(result).toBe(5000);
    expect(loadBestScore()).toBe(5000);
  });

  it("새 점수가 이전 기록보다 낮으면 저장하지 않고 기존 기록을 반환한다", () => {
    saveBestScoreIfHigher(5000);

    const result = saveBestScoreIfHigher(3000);

    expect(result).toBe(5000);
    expect(loadBestScore()).toBe(5000);
  });
});
