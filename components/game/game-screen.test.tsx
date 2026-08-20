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

test("게임 시작 시 첫 주문은 0~20초 구간의 1~2개 범위를 따른다", () => {
  for (let i = 0; i < 20; i += 1) {
    const { unmount } = render(<GameScreen />);
    const orderText = screen.getByTestId("stat-order").textContent ?? "";
    const quantity = Number(orderText.replace(/[^0-9]/g, ""));

    expect(quantity).toBeGreaterThanOrEqual(1);
    expect(quantity).toBeLessThanOrEqual(2);

    unmount();
  }
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

test("시간이 지날수록 남은 시간 표시가 줄어든다", () => {
  vi.useFakeTimers();
  render(<GameScreen />);

  expect(screen.getByTestId("stat-time")).toHaveTextContent("60");

  act(() => {
    vi.advanceTimersByTime(25_000);
  });

  expect(screen.getByTestId("stat-time")).toHaveTextContent("35");

  vi.useRealTimers();
});

test("60초가 끝나면 결과 화면이 나타나고 다시 굽기로 재시작할 수 있다", () => {
  vi.useFakeTimers();
  window.localStorage.clear();
  render(<GameScreen />);

  act(() => {
    vi.advanceTimersByTime(60_000);
  });

  expect(screen.getByTestId("result-screen")).toBeInTheDocument();
  expect(screen.queryByTestId("tray-1")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "다시 굽기" }));

  expect(screen.getByTestId("tray-1")).toBeInTheDocument();
  expect(screen.getByTestId("stat-time")).toHaveTextContent("60");

  vi.useRealTimers();
});

test("PERFECT로 콤보가 오르면 콤보 숫자에 팝 애니메이션 클래스가 붙는다", () => {
  vi.useFakeTimers();
  render(<GameScreen />);

  const tray1 = screen.getByTestId("tray-1");
  fireEvent.click(tray1);
  act(() => {
    vi.advanceTimersByTime(2800);
  });
  fireEvent.click(tray1); // PERFECT

  const comboNumber = screen.getByTestId("combo-number");
  expect(comboNumber.className).toMatch(/combo-pop/);

  vi.useRealTimers();
});

test("붕어빵이 타면 화면에 흔들림 애니메이션 클래스가 붙는다", () => {
  vi.useFakeTimers();
  render(<GameScreen />);

  const tray1 = screen.getByTestId("tray-1");
  fireEvent.click(tray1); // EMPTY -> BATTER, 이후 방치해서 자동으로 탐

  act(() => {
    // batter(600) + cooking(2200) + goodWindow(1000) + burnGrace(1200) = 5000ms
    vi.advanceTimersByTime(5000);
  });

  expect(tray1).toHaveAttribute("data-tray-state", "BURNT");
  expect(screen.getByTestId("game-screen").className).toMatch(/screen-shake/);

  vi.useRealTimers();
});

test("완성된 틀을 클릭하면 보관함으로 이동하고 틀은 빈 상태가 된다", () => {
  vi.useFakeTimers();
  render(<GameScreen />);

  const tray1 = screen.getByTestId("tray-1");
  fireEvent.click(tray1); // EMPTY -> BATTER
  act(() => {
    vi.advanceTimersByTime(2800); // batter+cooking 지나 뒤집기 타이밍 진입
  });
  fireEvent.click(tray1); // 뒤집기 -> COOKING_2
  act(() => {
    vi.advanceTimersByTime(1300); // cooking2 지나 완성
  });
  expect(tray1).toHaveAttribute("data-tray-state", "READY");

  fireEvent.click(tray1); // 완성 틀 클릭 -> 보관함으로 수확

  expect(tray1).toHaveAttribute("data-tray-state", "EMPTY");
  expect(screen.getAllByTestId("storage-item")).toHaveLength(1);

  vi.useRealTimers();
});

test("완성된 틀을 여러 개 수확하면 보관함 아이콘도 그만큼 늘어난다", () => {
  vi.useFakeTimers();
  render(<GameScreen />);

  const trayKeys = [1, 2];
  for (const key of trayKeys) {
    fireEvent.click(screen.getByTestId(`tray-${key}`));
  }
  act(() => {
    vi.advanceTimersByTime(2800);
  });
  for (const key of trayKeys) {
    fireEvent.click(screen.getByTestId(`tray-${key}`));
  }
  act(() => {
    vi.advanceTimersByTime(1300);
  });
  for (const key of trayKeys) {
    fireEvent.click(screen.getByTestId(`tray-${key}`)); // 수확
  }

  expect(screen.getAllByTestId("storage-item")).toHaveLength(2);

  vi.useRealTimers();
});

test("탄 붕어빵을 클릭해도 보관함에 쌓이지 않고 폐기된다", () => {
  vi.useFakeTimers();
  render(<GameScreen />);

  const tray1 = screen.getByTestId("tray-1");
  fireEvent.click(tray1); // EMPTY -> BATTER, 이후 방치해서 자동으로 탐

  act(() => {
    // batter(600) + cooking(2200) + goodWindow(1000) + burnGrace(1200) = 5000ms
    vi.advanceTimersByTime(5000);
  });

  expect(tray1).toHaveAttribute("data-tray-state", "BURNT");

  fireEvent.click(tray1); // 탄 붕어빵 클릭 -> 빈 틀로 폐기

  expect(tray1).toHaveAttribute("data-tray-state", "EMPTY");
  expect(screen.queryByTestId("storage-item")).not.toBeInTheDocument();

  vi.useRealTimers();
});

test("보관함이 주문 수량보다 적으면 부분 전달되고, 매출은 그대로이며 같은 손님이 유지된다", () => {
  vi.useFakeTimers();
  const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.99); // 0~20초 구간(1~2개) 중 2개로 고정
  render(<GameScreen />);

  expect(screen.getByTestId("stat-order")).toHaveTextContent("2개");

  const tray1 = screen.getByTestId("tray-1");
  fireEvent.click(tray1);
  act(() => {
    vi.advanceTimersByTime(2800);
  });
  fireEvent.click(tray1);
  act(() => {
    vi.advanceTimersByTime(1300);
  });
  fireEvent.click(tray1); // 수확 -> 보관함 1개 (주문 2개보다 적음)

  fireEvent.click(screen.getByTestId("customer-deliver-button"));

  expect(screen.getByTestId("stat-revenue")).toHaveTextContent("₩0");
  expect(screen.getByTestId("stat-order")).toHaveTextContent("1개");
  expect(screen.queryByTestId("storage-item")).not.toBeInTheDocument();
  expect(screen.getByTestId("customer-image").getAttribute("src")).toMatch(
    /waiting/
  );

  randomSpy.mockRestore();
  vi.useRealTimers();
});

test("보관함이 충분하면 전달되어 매출이 오르고, 손님이 기쁜 표정을 보인 뒤 다음 손님으로 넘어간다", () => {
  vi.useFakeTimers();
  render(<GameScreen />);

  expect(screen.getByTestId("customer-image").getAttribute("src")).toMatch(
    /waiting/
  );

  const trayKeys = [1, 2, 3, 4, 5, 6];
  for (const key of trayKeys) {
    fireEvent.click(screen.getByTestId(`tray-${key}`));
  }
  act(() => {
    vi.advanceTimersByTime(2800);
  });
  for (const key of trayKeys) {
    fireEvent.click(screen.getByTestId(`tray-${key}`));
  }
  act(() => {
    vi.advanceTimersByTime(1300);
  });
  for (const key of trayKeys) {
    fireEvent.click(screen.getByTestId(`tray-${key}`)); // 수확 6개 (주문 최대 2개보다 충분히 많음)
  }

  fireEvent.click(screen.getByTestId("customer-deliver-button"));

  expect(screen.getByTestId("delivery-feedback").textContent).toMatch(
    /전달/
  );
  expect(screen.getByTestId("stat-revenue")).not.toHaveTextContent("₩0");
  expect(screen.getByTestId("customer-image").getAttribute("src")).toMatch(
    /happy/
  );

  act(() => {
    vi.advanceTimersByTime(1100);
  });

  expect(screen.getByTestId("customer-image").getAttribute("src")).toMatch(
    /waiting/
  );

  vi.useRealTimers();
});

test("보관함이 비어있을 때 손님을 클릭하면 매출/주문 변화 없이 안내만 나타난다", () => {
  vi.useFakeTimers();
  render(<GameScreen />);

  fireEvent.click(screen.getByTestId("customer-deliver-button"));

  expect(screen.getByTestId("stat-revenue")).toHaveTextContent("₩0");
  expect(screen.getByTestId("empty-storage-notice")).toHaveTextContent(
    "붕어빵 없음"
  );
  expect(screen.queryByTestId("delivery-feedback")).not.toBeInTheDocument();

  vi.useRealTimers();
});

test("customerId=1(인내심 10초)은 정확히 10초가 되는 순간 화난 표정으로 바뀐다", () => {
  vi.useFakeTimers();
  const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0); // customerId=1, 주문 1개로 고정
  render(<GameScreen />);

  act(() => {
    vi.advanceTimersByTime(9_900);
  });
  expect(screen.getByTestId("customer-image").getAttribute("src")).not.toMatch(
    /angry/
  );

  act(() => {
    vi.advanceTimersByTime(100);
  });
  expect(screen.getByTestId("customer-image").getAttribute("src")).toMatch(
    /angry/
  );

  randomSpy.mockRestore();
  vi.useRealTimers();
});

test("customerId=4(인내심 18초)는 10초에는 실패하지 않고 18초에 실패한다", () => {
  vi.useFakeTimers();
  const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.99); // customerId=4, 주문 2개로 고정
  render(<GameScreen />);

  act(() => {
    vi.advanceTimersByTime(10_000);
  });
  expect(screen.getByTestId("customer-image").getAttribute("src")).not.toMatch(
    /angry/
  );

  act(() => {
    vi.advanceTimersByTime(8_000); // 누적 18,000ms
  });
  expect(screen.getByTestId("customer-image").getAttribute("src")).toMatch(
    /angry/
  );

  randomSpy.mockRestore();
  vi.useRealTimers();
});

test("주문 인내심을 초과하면 콤보가 초기화되고 매출에서 200원이 차감되며, 화난 표정을 3초간 보인 뒤 다음 손님으로 넘어간다", () => {
  vi.useFakeTimers();
  const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0); // customerId=1(인내심 10초), 주문 1개로 고정
  render(<GameScreen />);

  const tray1 = screen.getByTestId("tray-1");
  fireEvent.click(tray1);
  act(() => {
    vi.advanceTimersByTime(2800);
  });
  fireEvent.click(tray1); // PERFECT -> 콤보 1
  act(() => {
    vi.advanceTimersByTime(1300);
  });
  fireEvent.click(tray1); // 수확 -> 보관함 1개
  fireEvent.click(screen.getByTestId("customer-deliver-button")); // 주문 완료(1개), 매출 600원(500+콤보보너스 100), 새 주문 생성

  expect(screen.getByTestId("stat-combo")).toHaveTextContent("x1");
  expect(screen.getByTestId("stat-revenue")).toHaveTextContent("₩600");

  act(() => {
    // 배달 1초 뒤 손님이 바뀌는데, 직전 손님(customerId=1)은 제외되므로
    // 다음 손님은 customerId=2(인내심 13초)가 되어 그 기준으로 초과시킨다.
    vi.advanceTimersByTime(13_000);
  });

  expect(screen.getByTestId("stat-combo")).toHaveTextContent("x0");
  expect(screen.getByTestId("stat-revenue")).toHaveTextContent("₩400");
  expect(screen.getByTestId("customer-image").getAttribute("src")).toMatch(
    /angry/
  );

  act(() => {
    vi.advanceTimersByTime(3_000); // 화난 표정 유지 시간(3초) 경과
  });
  expect(screen.getByTestId("customer-image").getAttribute("src")).toMatch(
    /waiting/
  );

  randomSpy.mockRestore();
  vi.useRealTimers();
});

test("부분 전달을 하면 전달한 개수만큼(1개당 1초) 인내심 마감이 늦춰진다", () => {
  vi.useFakeTimers();
  const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.99); // customerId=4(인내심 18초), 주문 2개로 고정
  render(<GameScreen />);

  const tray1 = screen.getByTestId("tray-1");
  fireEvent.click(tray1);
  act(() => {
    vi.advanceTimersByTime(2800);
  });
  fireEvent.click(tray1); // PERFECT
  act(() => {
    vi.advanceTimersByTime(1300);
  });
  fireEvent.click(tray1); // 수확 -> 보관함 1개 (주문 2개보다 적음)
  fireEvent.click(screen.getByTestId("customer-deliver-button")); // 부분 전달 1개 -> 마감 1초 뒤로 밀림

  // 보너스가 없었다면 마감이었을 원래 18,000ms 시점에는 아직 화나지 않아야 한다.
  act(() => {
    vi.advanceTimersByTime(18_000 - 4_100);
  });
  expect(screen.getByTestId("customer-image").getAttribute("src")).not.toMatch(
    /angry/
  );

  // 부분 전달로 늦춰진 새 마감(19,000ms) 시점에는 화나야 한다.
  act(() => {
    vi.advanceTimersByTime(1_000);
  });
  expect(screen.getByTestId("customer-image").getAttribute("src")).toMatch(
    /angry/
  );

  randomSpy.mockRestore();
  vi.useRealTimers();
});

test("60초 안에 주문 실패가 발생하면 결과 화면에 FAILED 통계가 표시된다", () => {
  vi.useFakeTimers();
  const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0); // customerId=1(인내심 10초), 아무 조작도 하지 않아 계속 실패
  render(<GameScreen />);

  act(() => {
    vi.advanceTimersByTime(60_000);
  });

  const failedLabel = screen.getByText("FAILED");
  expect(failedLabel.nextElementSibling?.textContent).not.toBe("0");

  randomSpy.mockRestore();
  vi.useRealTimers();
});
