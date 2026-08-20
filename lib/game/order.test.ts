import { describe, expect, it } from "vitest";

import { BASE_PRICE, deliverToOrder, type Order } from "@/lib/game/order";

describe("deliverToOrder", () => {
  it("보관함 개수가 주문 수량보다 적으면 있는 만큼만 전달하고 주문이 유지된다", () => {
    const order: Order = { quantity: 3 };

    const result = deliverToOrder(order, 2);

    expect(result.deliveredCount).toBe(2);
    expect(result.order.quantity).toBe(1);
    expect(result.isComplete).toBe(false);
  });

  it("보관함 개수가 주문 수량과 정확히 같으면 전부 전달되고 주문이 완료된다", () => {
    const order: Order = { quantity: 3 };

    const result = deliverToOrder(order, 3);

    expect(result.deliveredCount).toBe(3);
    expect(result.order.quantity).toBe(0);
    expect(result.isComplete).toBe(true);
  });

  it("보관함 개수가 주문 수량보다 많아도 필요한 만큼만 전달되고 주문이 완료된다", () => {
    const order: Order = { quantity: 3 };

    const result = deliverToOrder(order, 6);

    expect(result.deliveredCount).toBe(3);
    expect(result.order.quantity).toBe(0);
    expect(result.isComplete).toBe(true);
  });

  it("기본 가격은 개당 500원이다", () => {
    expect(BASE_PRICE).toBe(500);
  });
});
