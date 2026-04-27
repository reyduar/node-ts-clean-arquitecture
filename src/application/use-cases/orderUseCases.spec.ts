import { describe, expect, it } from "vitest";
import { AddItemToOrder, CreateOrder } from "../index.js";
import {
  InMemoryOrderRepository,
  NoOpEventBus,
  StaticPricingService,
} from "../../infrastructure/index.js";

const fixedClock = {
  now: (): Date => new Date("2026-01-01T00:00:00.000Z"),
};

const makeUseCases = () => {
  const orders = new InMemoryOrderRepository();
  const eventBus = new NoOpEventBus();
  const pricing = new StaticPricingService({
    "SKU-1": { amount: 15, currency: "USD" },
  });

  return {
    addItemToOrder: new AddItemToOrder(orders, pricing, eventBus),
    createOrder: new CreateOrder(orders, eventBus, fixedClock),
    eventBus,
  };
};

describe("order use cases", () => {
  it("creates an order and adds an item using ports", async () => {
    const { addItemToOrder, createOrder, eventBus } = makeUseCases();

    const created = await createOrder.execute({
      orderId: "order-1",
      customerId: "customer-1",
    });

    const updated = await addItemToOrder.execute({
      orderId: "order-1",
      itemId: "item-1",
      sku: "sku-1",
      quantity: 2,
    });

    expect(created).toMatchObject({
      isSuccess: true,
      data: {
        orderId: "order-1",
        customerId: "customer-1",
        totals: [],
      },
    });
    expect(updated).toMatchObject({
      isSuccess: true,
      data: {
        orderId: "order-1",
        items: [
          {
            itemId: "item-1",
            sku: "SKU-1",
            quantity: 2,
            unitPrice: { currency: "USD", amount: 15 },
          },
        ],
        totals: [{ currency: "USD", amount: 30 }],
      },
    });
    expect(eventBus.publishedEvents.map((event) => event.eventName)).toEqual([
      "OrderCreated",
      "OrderItemAdded",
      "OrderTotalChanged",
    ]);
  });

  it("maps invalid input to validation errors", async () => {
    const { createOrder } = makeUseCases();

    const result = await createOrder.execute({
      orderId: "",
      customerId: "customer-1",
    });

    expect(result).toMatchObject({
      isFailure: true,
      error: { type: "validation", code: "order_id.empty" },
    });
  });

  it("maps missing orders to not found errors", async () => {
    const { addItemToOrder } = makeUseCases();

    const result = await addItemToOrder.execute({
      orderId: "missing-order",
      itemId: "item-1",
      sku: "sku-1",
      quantity: 1,
    });

    expect(result).toMatchObject({
      isFailure: true,
      error: { type: "not_found", code: "order.not_found" },
    });
  });

  it("maps duplicate order creation to conflict errors", async () => {
    const { createOrder } = makeUseCases();

    await createOrder.execute({
      orderId: "order-1",
      customerId: "customer-1",
    });

    const result = await createOrder.execute({
      orderId: "order-1",
      customerId: "customer-1",
    });

    expect(result).toMatchObject({
      isFailure: true,
      error: { type: "conflict", code: "order.already_exists" },
    });
  });
});
