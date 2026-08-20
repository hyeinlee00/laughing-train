"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { TRAY_LAYOUT_ROWS } from "@/lib/game/tray-layout";
import {
  activateTray,
  createEmptyTray,
  tickTray,
  type Tray as TrayData,
} from "@/lib/game/tray-state";
import {
  BASE_PRICE,
  FAILURE_PENALTY,
  createRandomOrder,
  deliverToOrder,
  type Order,
} from "@/lib/game/order";
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
  collectedCount: number;
  pendingDeliveredCount: number;
  revenue: number;
  combo: number;
  maxCombo: number;
  perfectCount: number;
  goodCount: number;
  burntCount: number;
  elapsedMs: number;
  shakeUntilMs: number;
  lastDelivery: { quantity: number; isComplete: boolean } | null;
  deliveryPopKey: number;
  emptyStoragePopKey: number;
  customerId: number;
  happyUntilMs: number;
  angryUntilMs: number;
  orderCreatedAtMs: number;
  failedCount: number;
};

const SHAKE_DURATION_MS = 300;
const HAPPY_DURATION_MS = 1000;
const ANGRY_DURATION_MS = 3000;
const PARTIAL_DELIVERY_BONUS_MS = 1000;

const CUSTOMER_PATIENCE_MS: Record<number, number> = {
  1: 10_000,
  2: 13_000,
  3: 16_000,
  4: 18_000,
};

function getCustomerPatienceMs(customerId: number): number {
  return CUSTOMER_PATIENCE_MS[customerId] ?? 10_000;
}

function randomCustomerId(): number {
  return 1 + Math.floor(Math.random() * 4);
}

function createInitialTrays(): Record<number, TrayData> {
  return Object.fromEntries(
    TRAY_KEYS.map((key) => [key, createEmptyTray()])
  );
}

function createInitialState(): GameState {
  const startingBand = getDifficultyBand(0);
  return {
    trays: createInitialTrays(),
    order: createRandomOrder(
      startingBand.minOrderQuantity,
      startingBand.maxOrderQuantity
    ),
    collectedCount: 0,
    pendingDeliveredCount: 0,
    revenue: 0,
    combo: 0,
    maxCombo: 0,
    perfectCount: 0,
    goodCount: 0,
    burntCount: 0,
    elapsedMs: 0,
    shakeUntilMs: 0,
    lastDelivery: null,
    deliveryPopKey: 0,
    emptyStoragePopKey: 0,
    customerId: randomCustomerId(),
    happyUntilMs: 0,
    angryUntilMs: 0,
    orderCreatedAtMs: 0,
    failedCount: 0,
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
  let customerId = state.customerId;
  let order = state.order;
  let orderCreatedAtMs = state.orderCreatedAtMs;
  let pendingDeliveredCount = state.pendingDeliveredCount;
  let revenue = state.revenue;
  let failedCount = state.failedCount;
  let angryUntilMs = state.angryUntilMs;

  if (
    state.happyUntilMs > 0 &&
    state.elapsedMs < state.happyUntilMs &&
    elapsedMs >= state.happyUntilMs
  ) {
    customerId = randomCustomerId();
  }

  if (
    state.angryUntilMs > 0 &&
    state.elapsedMs < state.angryUntilMs &&
    elapsedMs >= state.angryUntilMs
  ) {
    customerId = randomCustomerId();
  }

  const orderDeadlineMs =
    state.orderCreatedAtMs + getCustomerPatienceMs(state.customerId);
  const isOrderTimedOut =
    state.elapsedMs < orderDeadlineMs && elapsedMs >= orderDeadlineMs;

  if (isOrderTimedOut) {
    combo = nextCombo(combo, "FAILED");
    failedCount += 1;
    revenue = Math.max(0, revenue - FAILURE_PENALTY);
    angryUntilMs = elapsedMs + ANGRY_DURATION_MS;
    order = createRandomOrder(band.minOrderQuantity, band.maxOrderQuantity);
    orderCreatedAtMs = elapsedMs;
    pendingDeliveredCount = 0;
  }

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

  return {
    ...state,
    trays: nextTrays,
    combo,
    maxCombo,
    burntCount,
    shakeUntilMs,
    elapsedMs,
    customerId,
    order,
    orderCreatedAtMs,
    pendingDeliveredCount,
    revenue,
    failedCount,
    angryUntilMs,
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
      const { tray, judgement, harvested } = activateTray(
        current.trays[trayKey],
        band.timing
      );
      const combo = judgement
        ? nextCombo(current.combo, judgement)
        : current.combo;
      return {
        ...current,
        trays: { ...current.trays, [trayKey]: tray },
        collectedCount: current.collectedCount + (harvested ? 1 : 0),
        combo,
        maxCombo: Math.max(current.maxCombo, combo),
        perfectCount:
          current.perfectCount + (judgement === "PERFECT" ? 1 : 0),
        goodCount: current.goodCount + (judgement === "GOOD" ? 1 : 0),
      };
    });
  }, []);

  const handleDeliver = useCallback(() => {
    setGameState((current) => {
      if (current.elapsedMs >= GAME_DURATION_MS) {
        return current;
      }

      if (current.collectedCount === 0) {
        return {
          ...current,
          emptyStoragePopKey: current.emptyStoragePopKey + 1,
        };
      }

      const band = getDifficultyBand(Math.floor(current.elapsedMs / 1000));
      const { deliveredCount, order, isComplete } = deliverToOrder(
        current.order,
        current.collectedCount
      );
      const pendingDeliveredCount =
        current.pendingDeliveredCount + deliveredCount;

      const base = {
        ...current,
        collectedCount: current.collectedCount - deliveredCount,
        lastDelivery: { quantity: deliveredCount, isComplete },
        deliveryPopKey: current.deliveryPopKey + 1,
      };

      if (!isComplete) {
        return {
          ...base,
          order,
          pendingDeliveredCount,
          orderCreatedAtMs:
            current.orderCreatedAtMs +
            deliveredCount * PARTIAL_DELIVERY_BONUS_MS,
        };
      }

      return {
        ...base,
        order: createRandomOrder(band.minOrderQuantity, band.maxOrderQuantity),
        pendingDeliveredCount: 0,
        revenue:
          current.revenue +
          pendingDeliveredCount * BASE_PRICE +
          comboBonus(current.combo),
        happyUntilMs: current.elapsedMs + HAPPY_DURATION_MS,
        orderCreatedAtMs: current.elapsedMs,
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
    collectedCount,
    revenue,
    combo,
    maxCombo,
    perfectCount,
    goodCount,
    burntCount,
    elapsedMs,
    shakeUntilMs,
    lastDelivery,
    deliveryPopKey,
    emptyStoragePopKey,
    customerId,
    happyUntilMs,
    angryUntilMs,
    failedCount,
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
  const isCustomerHappy = elapsedMs < happyUntilMs;
  const isCustomerAngry = elapsedMs < angryUntilMs;
  const customerMood = isCustomerHappy
    ? "happy"
    : isCustomerAngry
      ? "angry"
      : "waiting";
  const customerImageSrc = `/assets/customers/customer_0${customerId}_${customerMood}.png`;
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
        failedCount={failedCount}
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
      <div className="grid grid-cols-4 gap-2 text-center text-sm sm:text-base font-game text-amber-100 [text-shadow:0_1px_3px_rgb(0_0_0_/_80%)]">
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
        <div data-testid="stat-order" className="flex flex-col items-center">
          주문
          <br />
          {order.quantity}개
        </div>
      </div>

      {lastDelivery && (
        <div
          key={deliveryPopKey}
          data-testid="delivery-feedback"
          className="text-center text-sm font-bold text-green-600 [animation:judgement-pop_1s_ease-out_forwards] dark:text-green-400"
        >
          🧑 손님에게 {lastDelivery.quantity}개 전달!
          {lastDelivery.isComplete ? " (주문 완료)" : " (조금 더 필요해요)"}
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          data-testid="customer-deliver-button"
          onClick={handleDeliver}
          className="flex flex-col items-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-testid="customer-image"
            src={customerImageSrc}
            alt="손님"
            className="h-36 w-auto object-contain sm:h-44"
          />
        </button>
        {emptyStoragePopKey > 0 && (
          <span
            key={emptyStoragePopKey}
            data-testid="empty-storage-notice"
            className="text-[10px] text-muted-foreground [animation:judgement-pop_0.8s_ease-out_forwards]"
          >
            붕어빵 없음
          </span>
        )}
        <div
          data-testid="storage-stack"
          className="flex min-h-10 w-[70%] flex-wrap items-center justify-start gap-1 rounded-md border-2 border-dashed border-border bg-black/10 px-2 py-1"
        >
          {Array.from({ length: collectedCount }).map((_, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={index}
              data-testid="storage-item"
              src="/assets/bungeoppang/ready.png"
              alt="완성된 붕어빵"
              className="h-8 w-auto object-contain"
            />
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-[70%] flex-col gap-2">
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
