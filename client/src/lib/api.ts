import type { ApiError } from "@ph/shared";

/**
 * Error thrown by `api()` for any non-2xx or success:false response.
 * `errors` carries the per-field messages from server-side validation.
 */
export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: ApiError["errors"],
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

/**
 * Thin fetch wrapper around our API envelope:
 *   { success: true, data: T } | { success: false, message, errors? }
 *
 * - always sends cookies (auth lives in an httpOnly cookie)
 * - throws ApiRequestError on failure so callers can use try/catch + toast
 */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      credentials: "include",
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiRequestError(0, "Cannot reach the server. Is the API running?");
  }

  let body: (ApiError & { data?: unknown }) | null = null;
  try {
    body = await res.json();
  } catch {
    // Non-JSON response (e.g. proxy error page)
  }

  if (!res.ok || !body || body.success === false) {
    throw new ApiRequestError(
      res.status,
      body?.message ?? "Something went wrong. Please try again.",
      body?.errors,
    );
  }

  return body.data as T;
}

export const http = {
  get: <T>(path: string) => api<T>(path),
  post: <T>(path: string, body?: unknown) =>
    api<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    api<T>(path, { method: "PATCH", body: body === undefined ? undefined : JSON.stringify(body) }),
  delete: <T>(path: string) => api<T>(path, { method: "DELETE" }),
};
