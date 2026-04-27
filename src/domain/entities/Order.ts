import { fail, ok, type Result } from "../../shared/Result.js";
import { DomainError } from "../errors/DomainError.js";
import type { DomainEvent } from "../events/DomainEvent.js";
import { OrderCreatedEvent } from "../events/OrderCreatedEvent.js";
import { OrderItemAddedEvent } from "../events/OrderItemAddedEvent.js";
import {
  type CurrencyTotalSnapshot,
  OrderTotalChangedEvent,
} from "../events/OrderTotalChangedEvent.js";
import { CustomerId } from "../value-objects/CustomerId.js";
import { Money } from "../value-objects/Money.js";
import { OrderId } from "../value-objects/OrderId.js";
import { OrderItem } from "./OrderItem.js";

export type OrderStatus = "draft" | "submitted" | "cancelled";

export class Order {
  private readonly itemsById = new Map<string, OrderItem>();
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(
    public readonly id: OrderId,
    public readonly customerId: CustomerId,
    public readonly createdAt: Date,
    public readonly status: OrderStatus,
  ) {}

  public static create(
    id: OrderId,
    customerId: CustomerId,
    createdAt: Date = new Date(),
  ): Result<Order, DomainError> {
    const order = new Order(id, customerId, createdAt, "draft");
    order.record(new OrderCreatedEvent(id.value, customerId.value, createdAt));

    return ok(order);
  }

  public addItem(item: OrderItem): Result<void, DomainError> {
    if (this.status !== "draft") {
      return fail(DomainError.create("order.not_draft", "Only draft orders can be changed."));
    }

    if (this.itemsById.has(item.id.value)) {
      return fail(
        DomainError.create("order.item.duplicate", "Order item id already exists in this order."),
      );
    }

    this.itemsById.set(item.id.value, item);
    this.record(
      new OrderItemAddedEvent(
        this.id.value,
        item.id.value,
        item.sku.value,
        item.quantity.value,
        item.unitPrice.value.currency.code,
        item.unitPrice.value.amount,
      ),
    );

    const totals = this.totalByCurrency();

    if (totals.isFailure) {
      return fail(totals.error);
    }

    this.record(new OrderTotalChangedEvent(this.id.value, totals.data));

    return ok(undefined);
  }

  public items(): readonly OrderItem[] {
    return Array.from(this.itemsById.values());
  }

  public totalByCurrency(): Result<readonly CurrencyTotalSnapshot[], DomainError> {
    const totals = new Map<string, Money>();

    for (const item of this.itemsById.values()) {
      const subtotal = item.subtotal();

      if (subtotal.isFailure) {
        return fail(subtotal.error);
      }

      const currencyCode = subtotal.data.currency.code;
      const current = totals.get(currencyCode) ?? Money.zero(subtotal.data.currency);
      const next = current.add(subtotal.data);

      if (next.isFailure) {
        return fail(next.error);
      }

      totals.set(currencyCode, next.data);
    }

    return ok(
      Array.from(totals.values()).map((total) => ({
        currency: total.currency.code,
        amount: total.amount,
      })),
    );
  }

  public pullDomainEvents(): readonly DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;

    return events;
  }

  private record(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
