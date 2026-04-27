import type { DomainEvent } from "./DomainEvent.js";

export class OrderCreatedEvent implements DomainEvent {
  public readonly eventName = "OrderCreated";
  public readonly occurredAt: Date;

  public constructor(
    public readonly aggregateId: string,
    public readonly customerId: string,
    occurredAt: Date = new Date(),
  ) {
    this.occurredAt = occurredAt;
  }
}
