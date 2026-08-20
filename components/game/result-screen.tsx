"use client";

import { Button } from "@/components/ui/button";
import type { Grade } from "@/lib/game/grade";

type ResultScreenProps = {
  revenue: number;
  bestScore: number;
  grade: Grade;
  perfectCount: number;
  goodCount: number;
  burntCount: number;
  maxCombo: number;
  onRestart: () => void;
};

export function ResultScreen({
  revenue,
  bestScore,
  grade,
  perfectCount,
  goodCount,
  burntCount,
  maxCombo,
  onRestart,
}: ResultScreenProps) {
  return (
    <div
      data-testid="result-screen"
      className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <span className="text-2xl">🔥 GAME OVER 🔥</span>

      <div>
        <p className="text-sm text-muted-foreground">오늘의 매출</p>
        <p className="text-4xl font-bold">₩{revenue}</p>
      </div>

      <p className="text-lg">🏆 {grade} 🏆</p>

      <p className="text-sm text-muted-foreground">
        개인 최고 기록 ₩{bestScore}
      </p>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
        <dt className="text-muted-foreground">PERFECT</dt>
        <dd>{perfectCount}</dd>
        <dt className="text-muted-foreground">GOOD</dt>
        <dd>{goodCount}</dd>
        <dt className="text-muted-foreground">BURNT</dt>
        <dd>{burntCount}</dd>
        <dt className="text-muted-foreground">MAX COMBO</dt>
        <dd>x{maxCombo}</dd>
      </dl>

      <Button size="lg" onClick={onRestart}>
        다시 굽기
      </Button>
    </div>
  );
}
