"use client";

import { useState } from "react";

import { GameScreen } from "@/components/game/game-screen";
import { StartScreen } from "@/components/game/start-screen";

type Screen = "start" | "playing";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("start");

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 dark:bg-black">
      {screen === "start" ? (
        <StartScreen onStart={() => setScreen("playing")} />
      ) : (
        <GameScreen />
      )}
    </div>
  );
}
