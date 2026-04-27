import { fail, ok, type Result } from "../../shared/Result.js";
import { DomainError } from "../errors/DomainError.js";
import { Money } from "./Money.js";

export class Price {
  private constructor(public readonly value: Money) {}

  public static create(value: Money): Result<Price, DomainError> {
    if (value.amount <= 0) {
      return fail(DomainError.create("price.not_positive", "Price must be greater than zero."));
    }

    return ok(new Price(value));
  }
}
