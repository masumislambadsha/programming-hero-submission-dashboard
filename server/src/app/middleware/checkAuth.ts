import type { NextFunction, Request, Response } from "express";
import type { Role } from "@ph/shared";
import { verifyToken } from "../lib/jwt";
import { AppError } from "../utils/AppError";
import config from "../config";

export interface AuthUser {
  id: string;
  role: Role;
}

/**
 * Step 1 of access control — AUTHENTICATION (AuthN).
 * "Is this caller who they claim to be?" — proven by a valid JWT cookie.
 */
export function checkAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[config.cookie.name] as string | undefined;

  if (!token) {
    return next(new AppError(401, "You must be logged in to do that."));
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
    next(new AppError(401, message));
  }
}

/**
 * Step 2 of access control — AUTHORIZATION (AuthZ).
 * "May this authenticated caller do this thing?" — via role.
 *
 * Usage: router.patch("/:id/review", checkAuth, requireRole("MENTOR"), handler)
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      // checkAuth must run first — this is a wiring bug if it happens.
      return next(new AppError(401, "You are not authenticated."));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "You don't have permission to do that."));
    }

    next();
  };
}
