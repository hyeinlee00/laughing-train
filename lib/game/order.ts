export type Order = {
  quantity: number;
};

export type DeliveryResult = {
  deliveredCount: number;
  order: Order;
  isComplete: boolean;
};

export const BASE_PRICE = 500;
export const MIN_ORDER_QUANTITY = 1;
export const MAX_ORDER_QUANTITY = 4;
export const FAILURE_PENALTY = 200;

export function deliverToOrder(
  order: Order,
  collectedCount: number
): DeliveryResult {
  const deliveredCount = Math.min(order.quantity, collectedCount);
  const remainingQuantity = order.quantity - deliveredCount;

  return {
    deliveredCount,
    order: { quantity: remainingQuantity },
    isComplete: remainingQuantity === 0,
  };
}

export function createRandomOrder(
  minQuantity: number = MIN_ORDER_QUANTITY,
  maxQuantity: number = MAX_ORDER_QUANTITY
): Order {
  const range = maxQuantity - minQuantity + 1;
  const quantity = minQuantity + Math.floor(Math.random() * range);
  return { quantity };
}
