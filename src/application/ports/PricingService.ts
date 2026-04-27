import type { Price, Sku } from "../../domain/index.js";
import type { Result } from "../../shared/Result.js";
import type { InfraError, NotFoundError } from "../errors.js";

export interface PricingService {
  currentPriceFor(sku: Sku): Promise<Result<Price, NotFoundError | InfraError>>;
}
