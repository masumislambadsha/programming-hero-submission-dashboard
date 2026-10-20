import type { NextFunction, Request, Response } from "express";
import type { Role } from "@ph/shared";
import { verifyToken } from "../lib/jwt";
import { AUTH_COOKIE } from "../lib/cookie";

/**
 * Step 1 of access control — AUTHENTICATION (AuthN).
 * "Is this caller who they claim to be?" — proven by a valid JWT.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE] as string | undefined;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "You must be logged in to do that.",
    });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    const message =
      err instanceof Error && err.name === "TokenExpiredError"
        ? "Your session has expired. Please log in again."
        : "Invalid session. Please log in again.";
    return res.status(401).json({ success: false, message });
  }
}

/**
 * Step 2 of access control — AUTHORIZATION (AuthZ).
 * "May this authenticated caller do this thing?" — via role.
 *
 * Usage: router.patch("/:id/review", requireAuth, requireRole("MENTOR"), handler)
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      // requireAuth must run first — this is a wiring bug if it happens.
      return res.status(401).json({ success: false, message: "Not authenticated." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to do that.",
      });
    }
    next();
  };
}
