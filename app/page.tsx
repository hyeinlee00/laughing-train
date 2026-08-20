"use client";

import { useState } from "react";

import { GameScreen } from "@/components/game/game-screen";
import { StartScreen } from "@/components/game/start-screen";

type Screen = "start" | "playing";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("start");

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-100 p-4 dark:bg-zinc-950">
      <div className="flex aspect-[9/16] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-zinc-50 shadow-lg dark:bg-black">
        {screen === "start" ? (
          <StartScreen onStart={() => setScreen("playing")} />
        ) : (
          <GameScreen />
        )}
      </div>
    </div>
  );
}
