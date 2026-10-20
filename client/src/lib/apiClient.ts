import type { ApiError } from "@ph/shared";

/**
 * Base URL for the Express API. In development the Next.js rewrite proxies
 * `/api/*` to localhost:4000, so the default is same-origin.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

/**
 * Error thrown by `apiClient` for any non-2xx or success:false response.
 * `errors` carries the per-field messages from server-side validation.
 */
export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string[]> | null,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

/**
 * Thin fetch wrapper around the API envelope:
 *   { success: true, message, data, meta } | { success: false, message, errors }
 *
 * - always sends cookies (auth lives in an httpOnly cookie)
 * - throws ApiRequestError on failure so hooks/callers can surface a message
 * - returns the full envelope so callers can read `data` and `meta`
 */
async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      ...rest,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiRequestError(0, "Cannot reach the server. Is the API running?");
  }

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    // Non-JSON response (e.g. a proxy error page)
  }

  const envelope = payload as (ApiError & { data?: unknown }) | null;

  if (!res.ok || !envelope || envelope.success === false) {
    throw new ApiRequestError(
      res.status,
      envelope?.message ?? "Something went wrong. Please try again.",
      envelope?.errors,
    );
  }

  return envelope as T;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default apiClient;
