import { DEFAULT_TIMING, type TimingConfig } from "@/lib/game/tray-state";

export type DifficultyBand = {
  timing: TimingConfig;
  minOrderQuantity: number;
  maxOrderQuantity: number;
};

const EARLY_BAND: DifficultyBand = {
  timing: DEFAULT_TIMING,
  minOrderQuantity: 1,
  maxOrderQuantity: 2,
};

const MID_BAND: DifficultyBand = {
  timing: {
    ...DEFAULT_TIMING,
    cookingMs: 1700,
    goodWindowMs: 800,
  },
  minOrderQuantity: 2,
  maxOrderQuantity: 3,
};

const LATE_BAND: DifficultyBand = {
  timing: {
    ...DEFAULT_TIMING,
    cookingMs: 1300,
    goodWindowMs: 600,
  },
  minOrderQuantity: 2,
  maxOrderQuantity: 4,
};

export function getDifficultyBand(elapsedSeconds: number): DifficultyBand {
  if (elapsedSeconds < 20) return EARLY_BAND;
  if (elapsedSeconds < 40) return MID_BAND;
  return LATE_BAND;
}
