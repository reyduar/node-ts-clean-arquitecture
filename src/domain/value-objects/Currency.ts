import { fail, ok, type Result } from "../../shared/Result.js";
import { DomainError } from "../errors/DomainError.js";

export class Currency {
  private static readonly symbolsByCode = {
    ARS: "$",
    BRL: "R$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    USD: "$",
  } as const;

  private constructor(
    public readonly code: keyof typeof Currency.symbolsByCode,
    public readonly symbol: string,
  ) {}

  public static create(code: string): Result<Currency, DomainError> {
    const normalizedCode = code.trim().toUpperCase();
    const symbol = Currency.symbolsByCode[normalizedCode as keyof typeof Currency.symbolsByCode];

    if (symbol === undefined) {
      return fail(
        DomainError.create(
          "currency.unsupported",
          "Currency must be one of the supported ISO currency codes.",
        ),
      );
    }

    return ok(new Currency(normalizedCode as keyof typeof Currency.symbolsByCode, symbol));
  }

  public equals(other: Currency): boolean {
    return this.code === other.code;
  }
}
