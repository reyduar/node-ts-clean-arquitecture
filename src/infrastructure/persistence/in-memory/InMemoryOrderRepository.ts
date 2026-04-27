import type { Order } from "../../../domain/index.js";
import { ok, type Result } from "../../../shared/Result.js";
import type { ConflictError, InfraError } from "../../../application/errors.js";
import type { OrderRepository } from "../../../application/ports/OrderRepository.js";

export class InMemoryOrderRepository implements OrderRepository {
  private readonly ordersById = new Map<string, Order>();

  public async findById(orderId: string): Promise<Result<Order | null, InfraError>> {
    return ok(this.ordersById.get(orderId) ?? null);
  }

  public async save(order: Order): Promise<Result<void, ConflictError | InfraError>> {
    this.ordersById.set(order.id.value, order);

    return ok(undefined);
  }
}
