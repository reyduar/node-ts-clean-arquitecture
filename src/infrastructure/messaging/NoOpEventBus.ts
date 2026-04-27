import type { DomainEvent } from "../../domain/index.js";
import { ok, type Result } from "../../shared/Result.js";
import type { InfraError } from "../../application/errors.js";
import type { EventBus } from "../../application/ports/EventBus.js";

export class NoOpEventBus implements EventBus {
  public readonly publishedEvents: DomainEvent[] = [];

  public async publish(events: readonly DomainEvent[]): Promise<Result<void, InfraError>> {
    this.publishedEvents.push(...events);

    return ok(undefined);
  }
}
