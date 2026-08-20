import { describe, expect, it } from "vitest";

import { BASE_PRICE, quoteSale, type Order } from "@/lib/game/order";

describe("quoteSale", () => {
  it("완성 붕어빵이 주문 수량보다 적으면 판매할 수 없다", () => {
    const order: Order = { quantity: 3 };

    const quote = quoteSale(order, 2);

    expect(quote.canSell).toBe(false);
    expect(quote.revenue).toBe(0);
  });

  it("완성 붕어빵이 정확히 주문 수량이면 서비스 보너스 없이 기본 판매된다", () => {
    const order: Order = { quantity: 3 };

    const quote = quoteSale(order, 3);

    expect(quote.canSell).toBe(true);
    expect(quote.hasServiceBonus).toBe(false);
    expect(quote.unitsSold).toBe(3);
    expect(quote.revenue).toBe(1500);
  });

  it("완성 붕어빵이 주문 수량보다 1개 많으면 서비스 보너스가 적용된다", () => {
    const order: Order = { quantity: 3 };

    const quote = quoteSale(order, 4);

    expect(quote.hasServiceBonus).toBe(true);
    expect(quote.unitsSold).toBe(4);
    expect(quote.revenue).toBe(2000);
  });

  it("완성 붕어빵이 주문 수량보다 2개 이상 많아도 서비스 보너스는 1개분만 적용된다", () => {
    const order: Order = { quantity: 3 };

    const quote = quoteSale(order, 6);

    expect(quote.hasServiceBonus).toBe(true);
    expect(quote.unitsSold).toBe(4);
    expect(quote.revenue).toBe(2000);
  });

  it("기본 가격은 개당 500원이다", () => {
    expect(BASE_PRICE).toBe(500);
  });
});
