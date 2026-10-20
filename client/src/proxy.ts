import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 proxy (formerly "middleware").
 *
 * Runs BEFORE any page renders. Its only job here: keep anonymous visitors
 * out of protected pages and send logged-in users away from auth pages.
 *
 * This checks for the *presence* of the auth cookie — not its contents.
 * Verifying the JWT + the user's role happens server-side, inside the pages
 * and the Express API, because the proxy must stay a fast, stateless gate.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("ph_token");

  const authPages = ["/login", "/signup"];
  const protectedPrefixes = ["/dashboard", "/mentor"];

  if (protectedPrefixes.some((p) => pathname.startsWith(p)) && !hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (authPages.includes(pathname) && hasSession) {
    // Already logged in — the page itself decides the right home
    // (students → /dashboard, mentors → /mentor).
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/mentor/:path*", "/login", "/signup"],
};
