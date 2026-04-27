import {
  OrderItem,
  OrderItemId,
  Quantity,
  Sku,
} from "../../domain/index.js";
import { fail, ok, type Result } from "../../shared/Result.js";
import type { AddItemToOrderDto } from "../dto/AddItemToOrderDto.js";
import { infraError, notFoundError, type AppError } from "../errors.js";
import type { EventBus } from "../ports/EventBus.js";
import type { OrderRepository } from "../ports/OrderRepository.js";
import type { PricingService } from "../ports/PricingService.js";
import { mapDomainError } from "./errorMappers.js";
import { toOrderSnapshot, type OrderSnapshot } from "./OrderSnapshot.js";

export class AddItemToOrder {
  public constructor(
    private readonly orders: OrderRepository,
    private readonly pricing: PricingService,
    private readonly eventBus: EventBus,
  ) {}

  public async execute(dto: AddItemToOrderDto): Promise<Result<OrderSnapshot, AppError>> {
    try {
      const itemId = OrderItemId.create(dto.itemId);

      if (itemId.isFailure) {
        return fail(mapDomainError(itemId.error));
      }

      const sku = Sku.create(dto.sku);

      if (sku.isFailure) {
        return fail(mapDomainError(sku.error));
      }

      const quantity = Quantity.create(dto.quantity);

      if (quantity.isFailure) {
        return fail(mapDomainError(quantity.error));
      }

      const orderResult = await this.orders.findById(dto.orderId);

      if (orderResult.isFailure) {
        return fail(orderResult.error);
      }

      if (orderResult.data === null) {
        return fail(notFoundError("order.not_found", "Order was not found."));
      }

      const price = await this.pricing.currentPriceFor(sku.data);

      if (price.isFailure) {
        return fail(price.error);
      }

      const item = OrderItem.create(itemId.data, sku.data, price.data, quantity.data);

      if (item.isFailure) {
        return fail(mapDomainError(item.error));
      }

      const addItemResult = orderResult.data.addItem(item.data);

      if (addItemResult.isFailure) {
        return fail(mapDomainError(addItemResult.error));
      }

      const saveResult = await this.orders.save(orderResult.data);

      if (saveResult.isFailure) {
        return fail(saveResult.error);
      }

      const publishResult = await this.eventBus.publish(orderResult.data.pullDomainEvents());

      if (publishResult.isFailure) {
        return fail(publishResult.error);
      }

      return ok(toOrderSnapshot(orderResult.data));
    } catch (error) {
      return fail(infraError("use_case.unexpected", "Unexpected error adding item to order.", error));
    }
  }
}
