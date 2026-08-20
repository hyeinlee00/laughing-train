"use client";

import { useState } from "react";

import { GameScreen } from "@/components/game/game-screen";
import { StartScreen } from "@/components/game/start-screen";

type Screen = "start" | "playing";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("start");

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-100 p-4 dark:bg-zinc-950">
      <div className="relative flex aspect-[9/16] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-border shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-testid="background-image"
          src="/assets/backgrounds/night-market.svg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative z-10 flex flex-1 flex-col bg-zinc-50/90 dark:bg-black/85">
          {screen === "start" ? (
            <StartScreen onStart={() => setScreen("playing")} />
          ) : (
            <GameScreen />
          )}
        </div>
      </div>
    </div>
  );
}
