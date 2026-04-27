import type { DomainEvent } from "./DomainEvent.js";

export class OrderItemAddedEvent implements DomainEvent {
  public readonly eventName = "OrderItemAdded";
  public readonly occurredAt: Date;

  public constructor(
    public readonly aggregateId: string,
    public readonly itemId: string,
    public readonly sku: string,
    public readonly quantity: number,
    public readonly currency: string,
    public readonly unitAmount: number,
    occurredAt: Date = new Date(),
  ) {
    this.occurredAt = occurredAt;
  }
}
