import type { DomainEvent } from "../../domain/index.js";
import type { Result } from "../../shared/Result.js";
import type { InfraError } from "../errors.js";

export interface EventBus {
  publish(events: readonly DomainEvent[]): Promise<Result<void, InfraError>>;
}
