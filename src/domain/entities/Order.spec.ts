import { describe, expect, it } from "vitest";
import {
  Currency,
  CustomerId,
  Money,
  Order,
  OrderId,
  OrderItem,
  OrderItemId,
  Price,
  Quantity,
  Sku,
} from "../index.js";

const unwrap = <T>(result: { isSuccess: true; data: T } | { isFailure: true; error: unknown }): T => {
  if ("data" in result) {
    return result.data;
  }

  throw result.error;
};

describe("Order", () => {
  it("records creation, item added, and total changed events", () => {
    const usd = unwrap(Currency.create("usd"));
    const order = unwrap(
      Order.create(unwrap(OrderId.create("order-1")), unwrap(CustomerId.create("customer-1"))),
    );
    const item = unwrap(
      OrderItem.create(
        unwrap(OrderItemId.create("item-1")),
        unwrap(Sku.create("sku-1")),
        unwrap(Price.create(unwrap(Money.create(10, usd)))),
        unwrap(Quantity.create(2)),
      ),
    );

    const added = order.addItem(item);

    expect(added.isSuccess).toBe(true);
    expect(order.totalByCurrency()).toMatchObject({
      isSuccess: true,
      data: [{ currency: "USD", amount: 20 }],
    });
    expect(order.pullDomainEvents().map((event) => event.eventName)).toEqual([
      "OrderCreated",
      "OrderItemAdded",
      "OrderTotalChanged",
    ]);
  });

  it("groups totals by currency", () => {
    const usd = unwrap(Currency.create("USD"));
    const eur = unwrap(Currency.create("EUR"));
    const order = unwrap(
      Order.create(unwrap(OrderId.create("order-1")), unwrap(CustomerId.create("customer-1"))),
    );

    order.addItem(
      unwrap(
        OrderItem.create(
          unwrap(OrderItemId.create("item-1")),
          unwrap(Sku.create("sku-1")),
          unwrap(Price.create(unwrap(Money.create(10, usd)))),
          unwrap(Quantity.create(2)),
        ),
      ),
    );
    order.addItem(
      unwrap(
        OrderItem.create(
          unwrap(OrderItemId.create("item-2")),
          unwrap(Sku.create("sku-2")),
          unwrap(Price.create(unwrap(Money.create(7, eur)))),
          unwrap(Quantity.create(3)),
        ),
      ),
    );

    expect(order.totalByCurrency()).toMatchObject({
      isSuccess: true,
      data: [
        { currency: "USD", amount: 20 },
        { currency: "EUR", amount: 21 },
      ],
    });
  });

  it("rejects invalid value objects", () => {
    expect(Currency.create("US").isFailure).toBe(true);
    expect(Currency.create("ABC").isFailure).toBe(true);
    expect(Sku.create("x").isFailure).toBe(true);
    expect(Quantity.create(0).isFailure).toBe(true);
    expect(Money.create(-1, unwrap(Currency.create("USD"))).isFailure).toBe(true);
  });
});
