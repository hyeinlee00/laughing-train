import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("시작 화면에서 게임 시작을 누르면 붕어빵 틀이 보이는 게임 화면으로 전환된다", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: "붕어빵 장인" })
  ).toBeInTheDocument();
  expect(screen.queryByTestId("tray-1")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "게임 시작" }));

  expect(screen.getByTestId("tray-1")).toBeInTheDocument();
});

test("포장마차 배경 이미지가 표시된다", () => {
  render(<Home />);

  expect(screen.getByTestId("background-image")).toHaveAttribute(
    "src",
    "/assets/backgrounds/night-market.svg"
  );
});
