export class DomainError {
  private constructor(
    public readonly code: string,
    public readonly message: string,
  ) {}

  public static create(code: string, message: string): DomainError {
    return new DomainError(code, message);
  }
}
