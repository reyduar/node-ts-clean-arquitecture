import type { Order, OrderStatus } from "../../domain/index.js";

export type OrderTotalSnapshot = {
  readonly currency: string;
  readonly amount: number;
};

export type OrderItemSnapshot = {
  readonly itemId: string;
  readonly sku: string;
  readonly quantity: number;
  readonly unitPrice: {
    readonly currency: string;
    readonly amount: number;
  };
};

export type OrderSnapshot = {
  readonly orderId: string;
  readonly customerId: string;
  readonly createdAt: Date;
  readonly status: OrderStatus;
  readonly items: readonly OrderItemSnapshot[];
  readonly totals: readonly OrderTotalSnapshot[];
};

export const toOrderSnapshot = (order: Order): OrderSnapshot => {
  const totals = order.totalByCurrency();

  return {
    orderId: order.id.value,
    customerId: order.customerId.value,
    createdAt: order.createdAt,
    status: order.status,
    items: order.items().map((item) => ({
      itemId: item.id.value,
      sku: item.sku.value,
      quantity: item.quantity.value,
      unitPrice: {
        currency: item.unitPrice.value.currency.code,
        amount: item.unitPrice.value.amount,
      },
    })),
    totals: totals.isSuccess ? totals.data : [],
  };
};
