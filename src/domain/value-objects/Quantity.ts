import { fail, ok, type Result } from "../../shared/Result.js";
import { DomainError } from "../errors/DomainError.js";

export class Quantity {
  private constructor(public readonly value: number) {}

  public static create(value: number): Result<Quantity, DomainError> {
    if (!Number.isInteger(value) || value <= 0) {
      return fail(
        DomainError.create("quantity.invalid", "Quantity must be a positive integer."),
      );
    }

    return ok(new Quantity(value));
  }
}
