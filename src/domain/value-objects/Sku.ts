import { fail, ok, type Result } from "../../shared/Result.js";
import { DomainError } from "../errors/DomainError.js";

export class Sku {
  private static readonly pattern = /^[A-Z0-9][A-Z0-9-_]{2,31}$/;

  private constructor(public readonly value: string) {}

  public static create(value: string): Result<Sku, DomainError> {
    const normalizedValue = value.trim().toUpperCase();

    if (!Sku.pattern.test(normalizedValue)) {
      return fail(
        DomainError.create(
          "sku.invalid",
          "SKU must be 3 to 32 characters and contain only uppercase letters, numbers, hyphens, or underscores.",
        ),
      );
    }

    return ok(new Sku(normalizedValue));
  }

  public equals(other: Sku): boolean {
    return this.value === other.value;
  }
}
