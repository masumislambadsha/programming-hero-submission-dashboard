/**
 * An error that is *expected* business logic (duplicate email, not found…),
 * already carrying the HTTP status and payload the client should see.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
