import { NextResponse, type NextRequest } from "next/server";

const ROLE_HOME: Record<string, string> = {
  STUDENT: "/dashboard",
  MENTOR: "/mentor",
};

/**
 * Read the role claim out of the JWT without verifying it. Verification is
 * unnecessary here — this only picks a redirect destination for UX; the
 * Express API enforces real RBAC on every endpoint.
 */
function roleFromToken(token: string): string | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as {
      role?: unknown;
    };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

function requiredRoleFor(pathname: string): string | null {
  if (pathname === "/mentor" || pathname.startsWith("/mentor/")) return "MENTOR";
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return "STUDENT";
  return null;
}

/**
 * True for App Router payload requests (client-side navigation) and <Link>
 * prefetches — never redirect those. Redirecting prefetches makes Next cache
 * the redirect in its client router cache, which can replay after login.
 */
function isRouterInternalRequest(request: NextRequest): boolean {
  if (request.headers.get("purpose") === "prefetch") return true;
  const dest = request.headers.get("sec-fetch-dest");
  return dest !== null && dest !== "document";
}

/**
 * Next.js 16 proxy (formerly "middleware").
 *
 * Runs before any page renders. It is only a fast UX gate:
 * - anonymous visits to /dashboard or /mentor → /login?next=<path>
 * - role mismatch → the caller's own home
 * - logged-in visits to /login or /signup → their home
 *
 * Real authorization lives in the Express API (checkAuth + requireRole).
 */
export function proxy(request: NextRequest) {
  if (isRouterInternalRequest(request)) return NextResponse.next();

  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get("ph_token")?.value;
  const role = token ? roleFromToken(token) : null;
  const isAuthenticated = Boolean(token);

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (isAuthPage) {
    if (!isAuthenticated) return NextResponse.next();

    const next = searchParams.get("next");
    let destination = ROLE_HOME[role ?? ""] ?? "/";

    // Honour ?next= only for same-site paths the caller's role may access.
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      const needed = requiredRoleFor(next);
      if (!needed || needed === role) destination = next;
    }

    return NextResponse.redirect(new URL(destination, request.url));
  }

  const needed = requiredRoleFor(pathname);
  if (needed) {
    if (!isAuthenticated) {
      const next = encodeURIComponent(pathname + request.nextUrl.search);
      return NextResponse.redirect(new URL(`/login?next=${next}`, request.url));
    }
    if (role && role !== needed) {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/mentor/:path*", "/login", "/signup"],
};

export { ROLE_HOME };
