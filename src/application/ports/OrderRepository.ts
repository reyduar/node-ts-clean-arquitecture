import type { Order } from "../../domain/index.js";
import type { Result } from "../../shared/Result.js";
import type { ConflictError, InfraError } from "../errors.js";

export interface OrderRepository {
  findById(orderId: string): Promise<Result<Order | null, InfraError>>;
  save(order: Order): Promise<Result<void, ConflictError | InfraError>>;
}
