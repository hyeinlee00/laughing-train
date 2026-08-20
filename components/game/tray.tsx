"use client";

import type { FlipJudgement, TrayState } from "@/lib/game/tray-state";

const STATE_LABELS: Record<TrayState, string> = {
  EMPTY: "빈 틀",
  BATTER: "반죽",
  COOKING: "굽는 중",
  FLIP_READY: "뒤집기!",
  COOKING_2: "마무리 굽는 중",
  READY: "완성!",
  BURNT: "💨 탄 붕어빵",
};

const JUDGEMENT_CLASSES: Record<FlipJudgement, string> = {
  PERFECT: "text-xl font-bold text-orange-600 dark:text-orange-400",
  GOOD: "text-sm font-bold",
  EARLY: "text-sm font-bold",
  LATE: "text-sm font-bold",
};

const STATE_CLASSES: Record<TrayState, string> = {
  EMPTY: "bg-muted",
  BATTER: "bg-amber-100 dark:bg-amber-950",
  COOKING: "bg-amber-200 dark:bg-amber-900",
  FLIP_READY: "bg-orange-300 dark:bg-orange-800",
  COOKING_2: "bg-amber-300 dark:bg-amber-800",
  READY: "bg-green-200 dark:bg-green-900",
  BURNT: "bg-neutral-700 text-neutral-100",
};

type TrayProps = {
  trayKey: number;
  state: TrayState;
  lastJudgement?: FlipJudgement;
  onActivate: (trayKey: number) => void;
};

export function Tray({
  trayKey,
  state,
  lastJudgement,
  onActivate,
}: TrayProps) {
  return (
    <button
      type="button"
      data-testid={`tray-${trayKey}`}
      data-tray-key={trayKey}
      data-tray-state={state}
      onClick={() => onActivate(trayKey)}
      className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-border text-foreground transition-transform duration-100 active:scale-95 ${STATE_CLASSES[state]}`}
    >
      <span className="text-xs text-muted-foreground">{trayKey}</span>
      <span className="text-sm">{STATE_LABELS[state]}</span>
      {lastJudgement && (
        <span
          data-testid={`tray-${trayKey}-judgement`}
          className={`[animation:judgement-pop_0.8s_ease-out_forwards] ${JUDGEMENT_CLASSES[lastJudgement]}`}
        >
          {lastJudgement}
        </span>
      )}
    </button>
  );
}
