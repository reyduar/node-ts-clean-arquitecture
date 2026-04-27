import { fail, ok, type Result } from "../../shared/Result.js";
import { DomainError } from "../errors/DomainError.js";

export class CustomerId {
  private constructor(public readonly value: string) {}

  public static create(value: string): Result<CustomerId, DomainError> {
    const normalizedValue = value.trim();

    if (normalizedValue.length === 0) {
      return fail(DomainError.create("customer_id.empty", "Customer id cannot be empty."));
    }

    return ok(new CustomerId(normalizedValue));
  }
}
