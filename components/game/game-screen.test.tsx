import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { GameScreen } from "@/components/game/game-screen";

test("6개의 붕어빵 틀이 넘버패드 배치 순서(4,5,6,1,2,3)로 렌더링된다", () => {
  render(<GameScreen />);

  const trays = screen.getAllByTestId(/^tray-/);
  const order = trays.map((tray) => tray.getAttribute("data-tray-key"));

  expect(order).toEqual(["4", "5", "6", "1", "2", "3"]);
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
  expect(tray3).toHaveAttribute("data-active", "false");

  fireEvent.click(tray3);
  expect(tray3).toHaveAttribute("data-active", "true");

  fireEvent.keyDown(window, { key: "3" });
  expect(tray3).toHaveAttribute("data-active", "false");
});
