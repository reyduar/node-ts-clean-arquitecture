export type ValidationError = {
  readonly type: "validation";
  readonly code: string;
  readonly message: string;
};

export type NotFoundError = {
  readonly type: "not_found";
  readonly code: string;
  readonly message: string;
};

export type ConflictError = {
  readonly type: "conflict";
  readonly code: string;
  readonly message: string;
};

export type InfraError = {
  readonly type: "infra";
  readonly code: string;
  readonly message: string;
  readonly cause?: unknown;
};

export type AppError = ValidationError | NotFoundError | ConflictError | InfraError;

export const validationError = (code: string, message: string): ValidationError => ({
  type: "validation",
  code,
  message,
});

export const notFoundError = (code: string, message: string): NotFoundError => ({
  type: "not_found",
  code,
  message,
});

export const conflictError = (code: string, message: string): ConflictError => ({
  type: "conflict",
  code,
  message,
});

export const infraError = (code: string, message: string, cause?: unknown): InfraError => {
  if (cause === undefined) {
    return { type: "infra", code, message };
  }

  return { type: "infra", code, message, cause };
};
