import type { Response } from "express";
import { env } from "../env";

export const AUTH_COOKIE = "ph_token";

/**
 * The JWT lives in an httpOnly cookie:
 * - httpOnly  → JavaScript (XSS) cannot read the token
 * - sameSite=lax → not sent on cross-site POSTs (basic CSRF hardening)
 * - secure    → HTTPS-only in production
 */
export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.COOKIE_SECURE,
    maxAge: 12 * 60 * 60 * 1000, // 12h — matches JWT expiry
    path: "/",
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.COOKIE_SECURE,
    path: "/",
  });
}
