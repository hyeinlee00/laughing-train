import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { GameScreen } from "@/components/game/game-screen";

afterEach(() => {
  vi.useRealTimers();
});

test("9개의 붕어빵 틀이 넘버패드 배치 순서(7,8,9,4,5,6,1,2,3)로 렌더링된다", () => {
  render(<GameScreen />);

  const trays = screen.getAllByTestId(/^tray-\d$/);
  const order = trays.map((tray) => tray.getAttribute("data-tray-key"));

  expect(order).toEqual(["7", "8", "9", "4", "5", "6", "1", "2", "3"]);
});

test("매출·남은 시간·콤보·현재 주문 표시 영역이 보인다", () => {
  render(<GameScreen />);

  expect(screen.getByTestId("stat-revenue")).toBeInTheDocument();
  expect(screen.getByTestId("stat-time")).toBeInTheDocument();
  expect(screen.getByTestId("stat-combo")).toBeInTheDocument();
  expect(screen.getByTestId("stat-order")).toBeInTheDocument();
});

test("마우스 클릭과 대응하는 키보드 숫자 입력이 같은 틀에 동일하게 동작한다", () => {
  render(<GameScreen />);

  const tray3 = screen.getByTestId("tray-3");
  expect(tray3).toHaveAttribute("data-tray-state", "EMPTY");
  fireEvent.click(tray3);
  expect(tray3).toHaveAttribute("data-tray-state", "BATTER");

  const tray4 = screen.getByTestId("tray-4");
  expect(tray4).toHaveAttribute("data-tray-state", "EMPTY");
  fireEvent.keyDown(window, { key: "4" });
  expect(tray4).toHaveAttribute("data-tray-state", "BATTER");
});

test("굽는 중에 너무 일찍 활성화해 EARLY로 판정되면 화면에 판정이 표시된다", () => {
  vi.useFakeTimers();
  render(<GameScreen />);

  const tray1 = screen.getByTestId("tray-1");
  fireEvent.click(tray1); // EMPTY -> BATTER
  vi.advanceTimersByTime(700); // batterMs(600)를 지나 COOKING 진입
  fireEvent.click(tray1); // COOKING 중 활성화 -> EARLY 판정

  expect(screen.getByTestId("tray-1-judgement")).toHaveTextContent("EARLY");

  vi.useRealTimers();
});

test("PERFECT 판정이 연속되면 콤보가 오르고, EARLY 판정에 초기화된다", () => {
  vi.useFakeTimers();
  render(<GameScreen />);

  const tray1 = screen.getByTestId("tray-1");
  const tray2 = screen.getByTestId("tray-2");

  fireEvent.click(tray1);
  fireEvent.click(tray2);
  act(() => {
    vi.advanceTimersByTime(2800); // 뒤집기 타이밍(퍼펙트 구간) 진입
  });

  fireEvent.click(tray1); // PERFECT
  expect(screen.getByTestId("stat-combo")).toHaveTextContent("x1");

  fireEvent.click(tray2); // PERFECT
  expect(screen.getByTestId("stat-combo")).toHaveTextContent("x2");

  // 아직 비어있는 tray3을 굽는 중(EARLY 구간)에 조기 클릭
  const tray3 = screen.getByTestId("tray-3");
  fireEvent.click(tray3);
  act(() => {
    vi.advanceTimersByTime(700);
  });
  fireEvent.click(tray3); // EARLY -> 콤보 초기화

  expect(screen.getByTestId("stat-combo")).toHaveTextContent("x0");

  vi.useRealTimers();
});

test("완성된 붕어빵이 쌓이면 자동으로 판매되어 매출이 오른다", () => {
  vi.useFakeTimers();
  render(<GameScreen />);

  const trayKeys = [1, 2, 3, 4, 5, 6];

  // 6개 틀 모두 반죽 시작
  for (const key of trayKeys) {
    fireEvent.click(screen.getByTestId(`tray-${key}`));
  }

  // batter(600) + cooking(2200) = 2800ms 지나 뒤집기 타이밍 진입
  act(() => {
    vi.advanceTimersByTime(2800);
  });

  // 뒤집기 타이밍 진입 직후(퍼펙트 구간)에 모두 뒤집기
  for (const key of trayKeys) {
    fireEvent.click(screen.getByTestId(`tray-${key}`));
  }

  // cooking2(1200) 지나 완성
  act(() => {
    vi.advanceTimersByTime(1300);
  });

  expect(screen.getByTestId("stat-revenue")).not.toHaveTextContent("₩0");

  vi.useRealTimers();
});
