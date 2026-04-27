import { Currency, Money, Price, Sku } from "../../domain/index.js";
import { fail, ok, type Result } from "../../shared/Result.js";
import {
  infraError,
  notFoundError,
  type InfraError,
  type NotFoundError,
} from "../../application/errors.js";
import type { PricingService } from "../../application/ports/PricingService.js";

export type StaticPrice = {
  readonly amount: number;
  readonly currency: string;
};

export class StaticPricingService implements PricingService {
  public constructor(private readonly pricesBySku: Readonly<Record<string, StaticPrice>>) {}

  public async currentPriceFor(sku: Sku): Promise<Result<Price, NotFoundError | InfraError>> {
    const price = this.pricesBySku[sku.value];

    if (price === undefined) {
      return fail(notFoundError("price.not_found", "Price was not found for SKU."));
    }

    const currency = Currency.create(price.currency);

    if (currency.isFailure) {
      return fail(infraError(currency.error.code, currency.error.message));
    }

    const money = Money.create(price.amount, currency.data);

    if (money.isFailure) {
      return fail(infraError(money.error.code, money.error.message));
    }

    const domainPrice = Price.create(money.data);

    if (domainPrice.isFailure) {
      return fail(infraError(domainPrice.error.code, domainPrice.error.message));
    }

    return ok(domainPrice.data);
  }
}
