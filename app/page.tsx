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
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/assets/backgrounds/night-market.svg)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/55" />
        <div className="relative z-10 flex flex-1 flex-col text-white">
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
