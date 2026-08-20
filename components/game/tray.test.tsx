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
