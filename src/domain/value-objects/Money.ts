import { fail, ok, type Result } from "../../shared/Result.js";
import { DomainError } from "../errors/DomainError.js";
import { Currency } from "./Currency.js";

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: Currency,
  ) {}

  public static create(amount: number, currency: Currency): Result<Money, DomainError> {
    if (!Number.isFinite(amount)) {
      return fail(DomainError.create("money.amount.invalid", "Money amount must be finite."));
    }

    if (amount < 0) {
      return fail(DomainError.create("money.amount.negative", "Money amount cannot be negative."));
    }

    return ok(new Money(amount, currency));
  }

  public static zero(currency: Currency): Money {
    return new Money(0, currency);
  }

  public add(other: Money): Result<Money, DomainError> {
    if (!this.currency.equals(other.currency)) {
      return fail(
        DomainError.create(
          "money.currency.mismatch",
          "Cannot add money values with different currencies.",
        ),
      );
    }

    return ok(new Money(this.amount + other.amount, this.currency));
  }

  public multiply(multiplier: number): Result<Money, DomainError> {
    if (!Number.isFinite(multiplier) || multiplier < 0) {
      return fail(
        DomainError.create("money.multiplier.invalid", "Money multiplier must be finite and positive."),
      );
    }

    return ok(new Money(this.amount * multiplier, this.currency));
  }

  public equals(other: Money): boolean {
    return this.amount === other.amount && this.currency.equals(other.currency);
  }
}
