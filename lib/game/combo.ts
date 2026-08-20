export type ComboEvent =
  | "PERFECT"
  | "GOOD"
  | "EARLY"
  | "LATE"
  | "BURNT"
  | "FAILED";

export const COMBO_BONUS_PER_STACK = 100;

export function nextCombo(combo: number, event: ComboEvent): number {
  switch (event) {
    case "PERFECT":
      return combo + 1;
    case "GOOD":
      return combo;
    case "EARLY":
    case "LATE":
    case "BURNT":
    case "FAILED":
      return 0;
  }
}

export function comboBonus(combo: number): number {
  return combo * COMBO_BONUS_PER_STACK;
}
