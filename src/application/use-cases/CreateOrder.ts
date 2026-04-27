import { CustomerId, Order, OrderId } from "../../domain/index.js";
import { fail, ok, type Result } from "../../shared/Result.js";
import type { CreateOrderDto } from "../dto/CreateOrderDto.js";
import { conflictError, infraError, type AppError } from "../errors.js";
import type { Clock } from "../ports/Clock.js";
import type { EventBus } from "../ports/EventBus.js";
import type { OrderRepository } from "../ports/OrderRepository.js";
import { mapDomainError } from "./errorMappers.js";
import { toOrderSnapshot, type OrderSnapshot } from "./OrderSnapshot.js";

export class CreateOrder {
  public constructor(
    private readonly orders: OrderRepository,
    private readonly eventBus: EventBus,
    private readonly clock: Clock,
  ) {}

  public async execute(dto: CreateOrderDto): Promise<Result<OrderSnapshot, AppError>> {
    try {
      const orderId = OrderId.create(dto.orderId);

      if (orderId.isFailure) {
        return fail(mapDomainError(orderId.error));
      }

      const customerId = CustomerId.create(dto.customerId);

      if (customerId.isFailure) {
        return fail(mapDomainError(customerId.error));
      }

      const existingOrder = await this.orders.findById(orderId.data.value);

      if (existingOrder.isFailure) {
        return fail(existingOrder.error);
      }

      if (existingOrder.data !== null) {
        return fail(conflictError("order.already_exists", "Order already exists."));
      }

      const order = Order.create(orderId.data, customerId.data, this.clock.now());

      if (order.isFailure) {
        return fail(mapDomainError(order.error));
      }

      const saveResult = await this.orders.save(order.data);

      if (saveResult.isFailure) {
        return fail(saveResult.error);
      }

      const publishResult = await this.eventBus.publish(order.data.pullDomainEvents());

      if (publishResult.isFailure) {
        return fail(publishResult.error);
      }

      return ok(toOrderSnapshot(order.data));
    } catch (error) {
      return fail(infraError("use_case.unexpected", "Unexpected error creating order.", error));
    }
  }
}
