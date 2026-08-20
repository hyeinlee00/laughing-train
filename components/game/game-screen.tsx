"use client";

import { useCallback, useEffect, useState } from "react";

import { TRAY_LAYOUT_ROWS } from "@/lib/game/tray-layout";
import { Tray } from "@/components/game/tray";

const TRAY_KEYS = new Set(TRAY_LAYOUT_ROWS.flat());

export function GameScreen() {
  const [activeTrayKeys, setActiveTrayKeys] = useState<Set<number>>(
    () => new Set()
  );

  const handleActivate = useCallback((trayKey: number) => {
    setActiveTrayKeys((current) => {
      const next = new Set(current);
      if (next.has(trayKey)) {
        next.delete(trayKey);
      } else {
        next.add(trayKey);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const trayKey = Number(event.key);
      if (TRAY_KEYS.has(trayKey)) {
        handleActivate(trayKey);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleActivate]);

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
                isActive={activeTrayKeys.has(trayKey)}
                onActivate={handleActivate}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
