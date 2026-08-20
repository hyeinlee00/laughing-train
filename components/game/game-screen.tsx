"use client";

import { useCallback, useEffect, useState } from "react";

import { TRAY_LAYOUT_ROWS } from "@/lib/game/tray-layout";
import {
  activateTray,
  createEmptyTray,
  tickTray,
  type Tray as TrayData,
} from "@/lib/game/tray-state";
import { createRandomOrder, quoteSale, type Order } from "@/lib/game/order";
import { Tray } from "@/components/game/tray";

const TRAY_KEYS = TRAY_LAYOUT_ROWS.flat();
const TICK_MS = 100;

type GameState = {
  trays: Record<number, TrayData>;
  order: Order;
  revenue: number;
};

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
  };
}

function tickGameState(state: GameState): GameState {
  const nextTrays: Record<number, TrayData> = {};
  for (const key of TRAY_KEYS) {
    nextTrays[key] = tickTray(state.trays[key], TICK_MS);
  }

  const readyKeys = TRAY_KEYS.filter((key) => nextTrays[key].state === "READY");
  const quote = quoteSale(state.order, readyKeys.length);

  if (!quote.canSell) {
    return { ...state, trays: nextTrays };
  }

  const soldTrays = { ...nextTrays };
  for (const key of readyKeys.slice(0, quote.unitsSold)) {
    soldTrays[key] = createEmptyTray();
  }

  return {
    trays: soldTrays,
    order: createRandomOrder(),
    revenue: state.revenue + quote.revenue,
  };
}

export function GameScreen() {
  const [gameState, setGameState] = useState<GameState>(createInitialState);

  const handleActivate = useCallback((trayKey: number) => {
    setGameState((current) => {
      const { tray } = activateTray(current.trays[trayKey]);
      return {
        ...current,
        trays: { ...current.trays, [trayKey]: tray },
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

  const { trays, order, revenue } = gameState;

  return (
    <div className="flex w-full max-w-xl flex-col gap-4 p-4">
      <div className="grid grid-cols-4 gap-2 text-center text-sm sm:text-base">
        <div data-testid="stat-revenue">
          매출
          <br />₩{revenue}
        </div>
        <div data-testid="stat-time">
          남은 시간
          <br />
          60
        </div>
        <div data-testid="stat-combo">
          콤보
          <br />
          x0
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
