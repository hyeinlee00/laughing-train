import { expect, test } from "@playwright/test";

test("시작 화면이 열리고 게임 시작 버튼으로 게임 화면에 진입한다", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle("붕어빵 장인");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "붕어빵 장인"
  );

  await page.getByRole("button", { name: "게임 시작" }).click();

  await expect(page.getByTestId("tray-1")).toBeVisible();
});
