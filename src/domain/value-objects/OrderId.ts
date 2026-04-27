import { fail, ok, type Result } from "../../shared/Result.js";
import { DomainError } from "../errors/DomainError.js";

export class OrderId {
  private constructor(public readonly value: string) {}

  public static create(value: string): Result<OrderId, DomainError> {
    const normalizedValue = value.trim();

    if (normalizedValue.length === 0) {
      return fail(DomainError.create("order_id.empty", "Order id cannot be empty."));
    }

    return ok(new OrderId(normalizedValue));
  }

  public equals(other: OrderId): boolean {
    return this.value === other.value;
  }
}
