import "server-only";
import { cookies } from "next/headers";
import type { SafeUser } from "@ph/shared";

/**
 * Server-side access to the Express API.
 *
 * Server Components run on the Next server, so they must forward the
 * user's auth cookie manually — `credentials: "include"` only exists for
 * browser fetches.
 *
 * `cache: "no-store"` on purpose: every page read here is personalized or
 * review-state data. Freshness beats caching for this app (and keeps the
 * client-side cache topic honest — there is no stale data to fight).
 */
const API_URL = process.env.API_PROXY_URL ?? "http://localhost:4000";

export class ServerApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ServerApiError";
  }
}

export async function serverApi<T>(path: string): Promise<T> {
  const cookieStore = await cookies();

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    });
  } catch {
    throw new ServerApiError(503, "Cannot reach the API server. Is `pnpm dev` running?");
  }

  let body: { success: boolean; data?: T; message?: string } | null = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON response
  }

  if (!res.ok || !body?.success) {
    throw new ServerApiError(res.status, body?.message ?? "Request failed.");
  }

  return body.data as T;
}

/** The logged-in user, or null — verified server-side against the API. */
export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const { user } = await serverApi<{ user: SafeUser }>("/api/auth/me");
    return user;
  } catch {
    return null;
  }
}
