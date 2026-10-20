/**
 * An error that is *expected* business logic (duplicate email, not found…),
 * already carrying the HTTP status and payload the client should see.
 */
export class AppError extends Error {
  public readonly isOperational = true;

  constructor(
    public readonly statusCode: number,
    message: string,
    /** Field-level errors keyed by input field — surfaced by the forms. */
    public readonly errors?: Record<string, string[]> | null,
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}
