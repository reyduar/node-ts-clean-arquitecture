import type { DomainEvent } from "./DomainEvent.js";

export type CurrencyTotalSnapshot = Readonly<{
  currency: string;
  amount: number;
}>;

export class OrderTotalChangedEvent implements DomainEvent {
  public readonly eventName = "OrderTotalChanged";
  public readonly occurredAt: Date;

  public constructor(
    public readonly aggregateId: string,
    public readonly totals: readonly CurrencyTotalSnapshot[],
    occurredAt: Date = new Date(),
  ) {
    this.occurredAt = occurredAt;
  }
}
