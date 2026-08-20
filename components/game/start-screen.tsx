"use client";

import { Button } from "@/components/ui/button";

type StartScreenProps = {
  onStart: () => void;
};

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="text-5xl">🐟</span>
      <h1 className="text-3xl font-bold">붕어빵 장인</h1>
      <p className="text-muted-foreground">
        60초 동안
        <br />
        최대한 많이 벌어보세요.
      </p>
      <Button size="lg" onClick={onStart}>
        게임 시작
      </Button>
      <p className="text-xs text-muted-foreground">
        1~6 키 또는 마우스로 조작
      </p>
    </div>
  );
}
