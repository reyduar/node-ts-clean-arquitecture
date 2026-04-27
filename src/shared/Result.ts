export type Success<T> = {
  readonly success: true;
  readonly isSuccess: true;
  readonly isFailure: false;
  readonly data: T;
};

export type Failure<E> = {
  readonly success: false;
  readonly isSuccess: false;
  readonly isFailure: true;
  readonly error: E;
};

export type Result<T, E> = Success<T> | Failure<E>;

export const ok = <T>(data: T): Success<T> => ({
  success: true,
  isSuccess: true,
  isFailure: false,
  data,
});

export const fail = <E>(error: E): Failure<E> => ({
  success: false,
  isSuccess: false,
  isFailure: true,
  error,
});
