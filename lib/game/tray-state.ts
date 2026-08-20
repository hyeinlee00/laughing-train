export type TrayState =
  | "EMPTY"
  | "BATTER"
  | "COOKING"
  | "FLIP_READY"
  | "COOKING_2"
  | "READY"
  | "BURNT";

export type FlipJudgement = "PERFECT" | "GOOD" | "EARLY" | "LATE";

export type Tray = {
  state: TrayState;
  elapsedMs: number;
  lastJudgement?: FlipJudgement;
};

export type TimingConfig = {
  batterMs: number;
  cookingMs: number;
  perfectWindowMs: number;
  goodWindowMs: number;
  burnGraceMs: number;
  cooking2Ms: number;
};

export const DEFAULT_TIMING: TimingConfig = {
  batterMs: 600,
  cookingMs: 2200,
  perfectWindowMs: 400,
  goodWindowMs: 1000,
  burnGraceMs: 1200,
  cooking2Ms: 1200,
};

export function createEmptyTray(): Tray {
  return { state: "EMPTY", elapsedMs: 0 };
}

export function activateTray(
  tray: Tray,
  config: TimingConfig = DEFAULT_TIMING
): { tray: Tray; judgement?: FlipJudgement; harvested?: boolean } {
  switch (tray.state) {
    case "EMPTY":
      return { tray: { state: "BATTER", elapsedMs: 0 } };
    case "COOKING":
      return {
        tray: {
          state: "COOKING_2",
          elapsedMs: 0,
          lastJudgement: "EARLY",
        },
        judgement: "EARLY",
      };
    case "FLIP_READY": {
      const judgement: FlipJudgement =
        tray.elapsedMs <= config.perfectWindowMs
          ? "PERFECT"
          : tray.elapsedMs <= config.goodWindowMs
            ? "GOOD"
            : "LATE";
      return {
        tray: { state: "COOKING_2", elapsedMs: 0, lastJudgement: judgement },
        judgement,
      };
    }
    case "BURNT":
      return { tray: createEmptyTray() };
    case "READY":
      return { tray: createEmptyTray(), harvested: true };
    default:
      return { tray };
  }
}

export function tickTray(
  tray: Tray,
  deltaMs: number,
  config: TimingConfig = DEFAULT_TIMING
): Tray {
  const elapsedMs = tray.elapsedMs + deltaMs;

  switch (tray.state) {
    case "BATTER":
      return elapsedMs >= config.batterMs
        ? { state: "COOKING", elapsedMs: 0 }
        : { state: "BATTER", elapsedMs };
    case "COOKING":
      return elapsedMs >= config.cookingMs
        ? { state: "FLIP_READY", elapsedMs: 0 }
        : { state: "COOKING", elapsedMs };
    case "FLIP_READY":
      return elapsedMs >= config.goodWindowMs + config.burnGraceMs
        ? { state: "BURNT", elapsedMs: 0 }
        : { state: "FLIP_READY", elapsedMs };
    case "COOKING_2":
      return elapsedMs >= config.cooking2Ms
        ? { state: "READY", elapsedMs: 0 }
        : { state: "COOKING_2", elapsedMs };
    default:
      return tray;
  }
}
