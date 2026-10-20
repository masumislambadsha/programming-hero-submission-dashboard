import type { Response } from "express";
import config from "../config";

/**
 * The JWT lives in an httpOnly cookie:
 * - httpOnly      → JavaScript (XSS) cannot read the token
 * - sameSite=lax  → not sent on cross-site POSTs (basic CSRF hardening)
 * - secure        → HTTPS-only in production
 */
export function setAuthCookie(res: Response, token: string) {
  res.cookie(config.cookie.name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.cookie.secure,
    maxAge: config.cookie.maxAgeMs,
    path: "/",
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(config.cookie.name, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.cookie.secure,
    path: "/",
  });
}
