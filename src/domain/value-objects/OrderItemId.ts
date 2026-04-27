import { fail, ok, type Result } from "../../shared/Result.js";
import { DomainError } from "../errors/DomainError.js";

export class OrderItemId {
  private constructor(public readonly value: string) {}

  public static create(value: string): Result<OrderItemId, DomainError> {
    const normalizedValue = value.trim();

    if (normalizedValue.length === 0) {
      return fail(DomainError.create("order_item_id.empty", "Order item id cannot be empty."));
    }

    return ok(new OrderItemId(normalizedValue));
  }
}
