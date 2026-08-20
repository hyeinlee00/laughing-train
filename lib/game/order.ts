export type Order = {
  quantity: number;
};

export type SaleQuote = {
  canSell: boolean;
  unitsSold: number;
  hasServiceBonus: boolean;
  revenue: number;
};

export const BASE_PRICE = 500;
export const MIN_ORDER_QUANTITY = 1;
export const MAX_ORDER_QUANTITY = 4;

export function quoteSale(order: Order, readyCount: number): SaleQuote {
  if (readyCount < order.quantity) {
    return {
      canSell: false,
      unitsSold: 0,
      hasServiceBonus: false,
      revenue: 0,
    };
  }

  const hasServiceBonus = readyCount >= order.quantity + 1;
  const unitsSold = order.quantity + (hasServiceBonus ? 1 : 0);

  return {
    canSell: true,
    unitsSold,
    hasServiceBonus,
    revenue: unitsSold * BASE_PRICE,
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
