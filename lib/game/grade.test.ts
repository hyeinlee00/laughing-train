import { describe, expect, it } from "vitest";

import { getGrade } from "@/lib/game/grade";

describe("getGrade", () => {
  it("2,999원 이하는 견습생이다", () => {
    expect(getGrade(0)).toBe("견습생");
    expect(getGrade(2999)).toBe("견습생");
  });

  it("3,000~4,999원은 초보 장인이다", () => {
    expect(getGrade(3000)).toBe("초보 장인");
    expect(getGrade(4999)).toBe("초보 장인");
  });

  it("5,000~6,999원은 붕어빵 장인이다", () => {
    expect(getGrade(5000)).toBe("붕어빵 장인");
    expect(getGrade(6999)).toBe("붕어빵 장인");
  });

  it("7,000~9,999원은 명장이다", () => {
    expect(getGrade(7000)).toBe("명장");
    expect(getGrade(9999)).toBe("명장");
  });

  it("10,000원 이상은 전설의 붕어빵 장인이다", () => {
    expect(getGrade(10000)).toBe("전설의 붕어빵 장인");
    expect(getGrade(50000)).toBe("전설의 붕어빵 장인");
  });
});
