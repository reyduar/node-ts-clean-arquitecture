import type { DomainError } from "../../domain/index.js";
import { conflictError, type AppError, validationError } from "../errors.js";

const conflictDomainCodes = new Set(["order.item.duplicate", "order.not_draft"]);

export const mapDomainError = (error: DomainError): AppError => {
  if (conflictDomainCodes.has(error.code)) {
    return conflictError(error.code, error.message);
  }

  return validationError(error.code, error.message);
};
