import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { AddItemToOrder, CreateOrder } from "../../../application/index.js";
import {
  InMemoryOrderRepository,
  NoOpEventBus,
  OrdersController,
  StaticPricingService,
} from "../../index.js";

const makeApp = async () => {
  const orders = new InMemoryOrderRepository();
  const eventBus = new NoOpEventBus();
  const pricing = new StaticPricingService({
    "SKU-1": { amount: 10, currency: "USD" },
  });
  const clock = {
    now: (): Date => new Date("2026-01-01T00:00:00.000Z"),
  };
  const controller = new OrdersController({
    createOrder: new CreateOrder(orders, eventBus, clock),
    addItemToOrder: new AddItemToOrder(orders, pricing, eventBus),
  });
  const app = Fastify();

  await controller.register(app);
  await app.ready();

  return app;
};

describe("OrdersController", () => {
  it("creates an order and adds an item through HTTP routes", async () => {
    const app = await makeApp();

    const created = await app.inject({
      method: "POST",
      url: "/orders",
      payload: {
        orderId: "order-1",
        customerId: "customer-1",
      },
    });
    const updated = await app.inject({
      method: "POST",
      url: "/orders/order-1/items",
      payload: {
        itemId: "item-1",
        sku: "sku-1",
        quantity: 3,
      },
    });

    expect(created.statusCode).toBe(201);
    expect(updated.statusCode).toBe(200);
    expect(updated.json()).toMatchObject({
      orderId: "order-1",
      totals: [{ currency: "USD", amount: 30 }],
    });

    await app.close();
  });

  it("maps application errors to HTTP status codes", async () => {
    const app = await makeApp();

    const response = await app.inject({
      method: "POST",
      url: "/orders/missing-order/items",
      payload: {
        itemId: "item-1",
        sku: "sku-1",
        quantity: 1,
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: {
        type: "not_found",
        code: "order.not_found",
      },
    });

    await app.close();
  });
});
