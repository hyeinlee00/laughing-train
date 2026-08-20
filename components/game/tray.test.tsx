import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { Tray } from "@/components/game/tray";

test("PERFECT 판정 시 판정 텍스트에 팝업 애니메이션 클래스가 붙는다", () => {
  render(
    <Tray
      trayKey={1}
      state="COOKING_2"
      lastJudgement="PERFECT"
      onActivate={() => {}}
    />
  );

  const judgement = screen.getByTestId("tray-1-judgement");
  expect(judgement.className).toMatch(/judgement-pop/);
});

test("GOOD 판정은 PERFECT보다 작은 글자 크기로 표시된다", () => {
  render(
    <Tray
      trayKey={1}
      state="COOKING_2"
      lastJudgement="GOOD"
      onActivate={() => {}}
    />
  );

  const judgement = screen.getByTestId("tray-1-judgement");
  expect(judgement.className).not.toMatch(/text-xl/);
});

test("판정이 없으면 판정 텍스트가 보이지 않는다", () => {
  render(<Tray trayKey={1} state="EMPTY" onActivate={() => {}} />);

  expect(screen.queryByTestId("tray-1-judgement")).not.toBeInTheDocument();
});

test("조리 상태에 맞는 붕어빵 이미지가 표시된다", () => {
  render(<Tray trayKey={1} state="READY" onActivate={() => {}} />);

  const image = screen.getByRole("img");
  expect(image).toHaveAttribute("src", "/assets/bungeoppang/ready.svg");
});

test("빈 틀 상태에서는 붕어빵 이미지가 없다", () => {
  render(<Tray trayKey={1} state="EMPTY" onActivate={() => {}} />);

  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});
