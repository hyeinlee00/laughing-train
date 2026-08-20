"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { TRAY_LAYOUT_ROWS } from "@/lib/game/tray-layout";
import {
  activateTray,
  createEmptyTray,
  tickTray,
  type Tray as TrayData,
} from "@/lib/game/tray-state";
import { createRandomOrder, quoteSale, type Order } from "@/lib/game/order";
import { comboBonus, nextCombo } from "@/lib/game/combo";
import { getDifficultyBand } from "@/lib/game/difficulty";
import { getGrade } from "@/lib/game/grade";
import { loadBestScore, saveBestScoreIfHigher } from "@/lib/game/best-score";
import { Tray } from "@/components/game/tray";
import { ResultScreen } from "@/components/game/result-screen";

const TRAY_KEYS = TRAY_LAYOUT_ROWS.flat();
const TICK_MS = 100;
const GAME_DURATION_MS = 60_000;

type GameState = {
  trays: Record<number, TrayData>;
  order: Order;
  revenue: number;
  combo: number;
  maxCombo: number;
  perfectCount: number;
  goodCount: number;
  burntCount: number;
  elapsedMs: number;
  shakeUntilMs: number;
};

const SHAKE_DURATION_MS = 300;

function createInitialTrays(): Record<number, TrayData> {
  return Object.fromEntries(
    TRAY_KEYS.map((key) => [key, createEmptyTray()])
  );
}

function createInitialState(): GameState {
  return {
    trays: createInitialTrays(),
    order: createRandomOrder(),
    revenue: 0,
    combo: 0,
    maxCombo: 0,
    perfectCount: 0,
    goodCount: 0,
    burntCount: 0,
    elapsedMs: 0,
    shakeUntilMs: 0,
  };
}

function tickGameState(state: GameState): GameState {
  if (state.elapsedMs >= GAME_DURATION_MS) {
    return state;
  }

  const elapsedMs = Math.min(state.elapsedMs + TICK_MS, GAME_DURATION_MS);
  const band = getDifficultyBand(Math.floor(elapsedMs / 1000));

  const nextTrays: Record<number, TrayData> = {};
  let combo = state.combo;
  let burntCount = state.burntCount;
  let shakeUntilMs = state.shakeUntilMs;

  for (const key of TRAY_KEYS) {
    const previousTray = state.trays[key];
    const nextTray = tickTray(previousTray, TICK_MS, band.timing);
    if (previousTray.state !== "BURNT" && nextTray.state === "BURNT") {
      combo = nextCombo(combo, "BURNT");
      burntCount += 1;
      shakeUntilMs = elapsedMs + SHAKE_DURATION_MS;
    }
    nextTrays[key] = nextTray;
  }

  const maxCombo = Math.max(state.maxCombo, combo);

  const readyKeys = TRAY_KEYS.filter((key) => nextTrays[key].state === "READY");
  const quote = quoteSale(state.order, readyKeys.length);

  if (!quote.canSell) {
    return {
      ...state,
      trays: nextTrays,
      combo,
      maxCombo,
      burntCount,
      shakeUntilMs,
      elapsedMs,
    };
  }

  const soldTrays = { ...nextTrays };
  for (const key of readyKeys.slice(0, quote.unitsSold)) {
    soldTrays[key] = createEmptyTray();
  }

  return {
    ...state,
    trays: soldTrays,
    order: createRandomOrder(band.minOrderQuantity, band.maxOrderQuantity),
    revenue: state.revenue + quote.revenue + comboBonus(combo),
    combo,
    maxCombo,
    burntCount,
    shakeUntilMs,
    elapsedMs,
  };
}

export function GameScreen() {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [bestScore, setBestScore] = useState<number>(0);

  useEffect(() => {
    setBestScore(loadBestScore());
  }, []);

  const handleActivate = useCallback((trayKey: number) => {
    setGameState((current) => {
      if (current.elapsedMs >= GAME_DURATION_MS) {
        return current;
      }

      const band = getDifficultyBand(Math.floor(current.elapsedMs / 1000));
      const { tray, judgement } = activateTray(
        current.trays[trayKey],
        band.timing
      );
      const combo = judgement
        ? nextCombo(current.combo, judgement)
        : current.combo;
      return {
        ...current,
        trays: { ...current.trays, [trayKey]: tray },
        combo,
        maxCombo: Math.max(current.maxCombo, combo),
        perfectCount:
          current.perfectCount + (judgement === "PERFECT" ? 1 : 0),
        goodCount: current.goodCount + (judgement === "GOOD" ? 1 : 0),
      };
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const trayKey = Number(event.key);
      if (TRAY_KEYS.includes(trayKey)) {
        handleActivate(trayKey);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleActivate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(tickGameState);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const isGameOver = gameState.elapsedMs >= GAME_DURATION_MS;

  useEffect(() => {
    if (isGameOver) {
      setBestScore(saveBestScoreIfHigher(gameState.revenue));
    }
  }, [isGameOver, gameState.revenue]);

  const handleRestart = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  const {
    trays,
    order,
    revenue,
    combo,
    maxCombo,
    perfectCount,
    goodCount,
    burntCount,
    elapsedMs,
    shakeUntilMs,
  } = gameState;

  const previousComboRef = useRef(combo);
  const [comboPopKey, setComboPopKey] = useState(0);
  useEffect(() => {
    if (combo > previousComboRef.current) {
      setComboPopKey((key) => key + 1);
    }
    previousComboRef.current = combo;
  }, [combo]);

  const isShaking = elapsedMs < shakeUntilMs;
  const remainingSeconds = Math.max(
    0,
    Math.ceil((GAME_DURATION_MS - elapsedMs) / 1000)
  );

  if (isGameOver) {
    return (
      <ResultScreen
        revenue={revenue}
        bestScore={bestScore}
        grade={getGrade(revenue)}
        perfectCount={perfectCount}
        goodCount={goodCount}
        burntCount={burntCount}
        maxCombo={maxCombo}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div
      data-testid="game-screen"
      className={`flex flex-1 flex-col gap-4 p-4 ${isShaking ? "[animation:screen-shake_0.3s_ease-in-out]" : ""}`}
    >
      <div className="grid grid-cols-4 gap-2 text-center text-sm sm:text-base">
        <div data-testid="stat-revenue">
          매출
          <br />₩{revenue}
        </div>
        <div data-testid="stat-time">
          남은 시간
          <br />
          {remainingSeconds}
        </div>
        <div data-testid="stat-combo">
          콤보
          <br />
          <span
            key={comboPopKey}
            data-testid="combo-number"
            className="inline-block [animation:combo-pop_0.3s_ease-out]"
          >
            x{combo}
          </span>
        </div>
        <div data-testid="stat-order">
          주문
          <br />
          {order.quantity}개
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {TRAY_LAYOUT_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-3 gap-2">
            {row.map((trayKey) => (
              <Tray
                key={trayKey}
                trayKey={trayKey}
                state={trays[trayKey].state}
                lastJudgement={trays[trayKey].lastJudgement}
                onActivate={handleActivate}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
