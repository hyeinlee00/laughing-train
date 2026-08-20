"use client";

import { useCallback, useEffect, useState } from "react";

import { TRAY_LAYOUT_ROWS } from "@/lib/game/tray-layout";
import {
  activateTray,
  createEmptyTray,
  tickTray,
  type Tray as TrayData,
} from "@/lib/game/tray-state";
import { Tray } from "@/components/game/tray";

const TRAY_KEYS = TRAY_LAYOUT_ROWS.flat();
const TICK_MS = 100;

function createInitialTrays(): Record<number, TrayData> {
  return Object.fromEntries(
    TRAY_KEYS.map((key) => [key, createEmptyTray()])
  );
}

export function GameScreen() {
  const [trays, setTrays] = useState<Record<number, TrayData>>(
    createInitialTrays
  );

  const handleActivate = useCallback((trayKey: number) => {
    setTrays((current) => {
      const { tray } = activateTray(current[trayKey]);
      return { ...current, [trayKey]: tray };
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
      setTrays((current) => {
        const next: Record<number, TrayData> = { ...current };
        for (const key of TRAY_KEYS) {
          next[key] = tickTray(current[key], TICK_MS);
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-full max-w-xl flex-col gap-4 p-4">
      <div className="grid grid-cols-4 gap-2 text-center text-sm sm:text-base">
        <div data-testid="stat-revenue">
          매출
          <br />₩0
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
          <br />-
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
