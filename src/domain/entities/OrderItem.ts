import { fail, ok, type Result } from "../../shared/Result.js";
import { DomainError } from "../errors/DomainError.js";
import { Money } from "../value-objects/Money.js";
import { OrderItemId } from "../value-objects/OrderItemId.js";
import { Price } from "../value-objects/Price.js";
import { Quantity } from "../value-objects/Quantity.js";
import { Sku } from "../value-objects/Sku.js";

export class OrderItem {
  private constructor(
    public readonly id: OrderItemId,
    public readonly sku: Sku,
    public readonly unitPrice: Price,
    public readonly quantity: Quantity,
  ) {}

  public static create(
    id: OrderItemId,
    sku: Sku,
    unitPrice: Price,
    quantity: Quantity,
  ): Result<OrderItem, DomainError> {
    return ok(new OrderItem(id, sku, unitPrice, quantity));
  }

  public subtotal(): Result<Money, DomainError> {
    const subtotal = this.unitPrice.value.multiply(this.quantity.value);

    if (subtotal.isFailure) {
      return fail(subtotal.error);
    }

    return ok(subtotal.data);
  }
}
