import { fail, ok, type Result } from "../../shared/Result.js";
import { DomainError } from "../errors/DomainError.js";

export class ProductId {
  private constructor(public readonly value: string) {}

  public static create(value: string): Result<ProductId, DomainError> {
    const normalizedValue = value.trim();

    if (normalizedValue.length === 0) {
      return fail(DomainError.create("product_id.empty", "Product id cannot be empty."));
    }

    return ok(new ProductId(normalizedValue));
  }

  public equals(other: ProductId): boolean {
    return this.value === other.value;
  }
}
