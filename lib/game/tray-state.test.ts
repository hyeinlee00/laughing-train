import { describe, expect, it } from "vitest";

import {
  activateTray,
  createEmptyTray,
  DEFAULT_TIMING,
  tickTray,
  type Tray,
} from "@/lib/game/tray-state";

describe("activateTray", () => {
  it("빈 틀을 활성화하면 반죽 상태가 된다", () => {
    const { tray } = activateTray(createEmptyTray());

    expect(tray.state).toBe("BATTER");
  });

  it("굽는 중에 활성화하면 EARLY로 판정되고 마무리 굽기 상태가 된다", () => {
    const cookingTray: Tray = { state: "COOKING", elapsedMs: 100 };

    const { tray, judgement } = activateTray(cookingTray);

    expect(judgement).toBe("EARLY");
    expect(tray.state).toBe("COOKING_2");
    expect(tray.lastJudgement).toBe("EARLY");
  });

  it("빈 틀을 활성화하면 이전 판정 표시가 지워진다", () => {
    const emptyTray: Tray = {
      state: "EMPTY",
      elapsedMs: 0,
      lastJudgement: "LATE",
    };

    const { tray } = activateTray(emptyTray);

    expect(tray.lastJudgement).toBeUndefined();
  });

  it("뒤집기 타이밍 진입 직후(퍼펙트 구간)에 활성화하면 PERFECT로 판정된다", () => {
    const flipReadyTray: Tray = { state: "FLIP_READY", elapsedMs: 0 };

    const { judgement } = activateTray(flipReadyTray);

    expect(judgement).toBe("PERFECT");
  });

  it("퍼펙트 구간 이후 굿 구간에 활성화하면 GOOD으로 판정된다", () => {
    const flipReadyTray: Tray = {
      state: "FLIP_READY",
      elapsedMs: DEFAULT_TIMING.perfectWindowMs + 1,
    };

    const { judgement } = activateTray(flipReadyTray);

    expect(judgement).toBe("GOOD");
  });

  it("굿 구간 이후에 활성화하면 LATE로 판정된다", () => {
    const flipReadyTray: Tray = {
      state: "FLIP_READY",
      elapsedMs: DEFAULT_TIMING.goodWindowMs + 1,
    };

    const { judgement } = activateTray(flipReadyTray);

    expect(judgement).toBe("LATE");
  });

  it("탄 붕어빵을 활성화하면 빈 틀로 초기화된다", () => {
    const burntTray: Tray = { state: "BURNT", elapsedMs: 9999 };

    const { tray, judgement, harvested } = activateTray(burntTray);

    expect(tray.state).toBe("EMPTY");
    expect(judgement).toBeUndefined();
    expect(harvested).toBeUndefined();
  });

  it("완성 상태를 활성화하면 빈 틀이 되고 수확됨을 알린다", () => {
    const readyTray: Tray = { state: "READY", elapsedMs: 0 };

    const { tray, harvested } = activateTray(readyTray);

    expect(tray.state).toBe("EMPTY");
    expect(harvested).toBe(true);
  });
});

describe("tickTray", () => {
  it("반죽 상태는 batterMs가 지나면 굽는 중으로 자동 전환된다", () => {
    const tray: Tray = { state: "BATTER", elapsedMs: 0 };

    const next = tickTray(tray, DEFAULT_TIMING.batterMs);

    expect(next.state).toBe("COOKING");
  });

  it("굽는 중 상태는 cookingMs가 지나면 뒤집기 타이밍으로 자동 전환된다", () => {
    const tray: Tray = { state: "COOKING", elapsedMs: 0 };

    const next = tickTray(tray, DEFAULT_TIMING.cookingMs);

    expect(next.state).toBe("FLIP_READY");
  });

  it("마무리 굽기 상태는 cooking2Ms가 지나면 완성 상태로 자동 전환된다", () => {
    const tray: Tray = { state: "COOKING_2", elapsedMs: 0 };

    const next = tickTray(tray, DEFAULT_TIMING.cooking2Ms);

    expect(next.state).toBe("READY");
  });

  it("뒤집기 타이밍을 놓치고 굿 구간과 여유 시간이 모두 지나도록 방치하면 탄다", () => {
    const tray: Tray = { state: "FLIP_READY", elapsedMs: 0 };

    const next = tickTray(
      tray,
      DEFAULT_TIMING.goodWindowMs + DEFAULT_TIMING.burnGraceMs
    );

    expect(next.state).toBe("BURNT");
  });

  it("완성 상태는 readyBurnMs 이전이면 계속 완성 상태를 유지한다", () => {
    const tray: Tray = { state: "READY", elapsedMs: 0 };

    const next = tickTray(tray, DEFAULT_TIMING.readyBurnMs - 1);

    expect(next.state).toBe("READY");
  });

  it("완성 상태를 readyBurnMs 이상 방치하면 탄다", () => {
    const tray: Tray = { state: "READY", elapsedMs: 0 };

    const next = tickTray(tray, DEFAULT_TIMING.readyBurnMs);

    expect(next.state).toBe("BURNT");
  });

  it("서로 다른 두 틀은 독립적으로 상태를 유지한다", () => {
    const trayA: Tray = { state: "BATTER", elapsedMs: 0 };
    const trayB: Tray = { state: "COOKING", elapsedMs: 0 };

    const nextA = tickTray(trayA, DEFAULT_TIMING.batterMs);
    const nextB = tickTray(trayB, 1);

    expect(nextA.state).toBe("COOKING");
    expect(nextB.state).toBe("COOKING");
    expect(nextB.elapsedMs).toBe(1);
  });
});
