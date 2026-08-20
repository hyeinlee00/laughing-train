import { describe, expect, it } from "vitest";

import { TRAY_LAYOUT_ROWS } from "@/lib/game/tray-layout";

describe("TRAY_LAYOUT_ROWS", () => {
  it("넘버패드 물리적 배열과 동일하게 윗줄 4·5·6, 아랫줄 1·2·3 순서를 갖는다", () => {
    expect(TRAY_LAYOUT_ROWS).toEqual([
      [4, 5, 6],
      [1, 2, 3],
    ]);
  });
});
