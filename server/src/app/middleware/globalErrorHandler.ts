import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { sendErrorResponse } from "../utils/sendResponse";
import config from "../config";

/**
 * Central error handler — the last line of defense.
 *
 * Translates known error types into stable API responses and guarantees we
 * never leak stack traces or internal messages to clients in production.
 */
export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Expected business-logic errors (duplicates, missing records, auth, …)
  if (err instanceof AppError) {
    sendErrorResponse(res, err.statusCode, err.message, err.errors);
    return;
  }

  // Zod errors that bypassed the validate middleware
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "_";
      (errors[key] ??= []).push(issue.message);
    }
    sendErrorResponse(res, 422, "Validation failed. Please fix the highlighted fields.", errors);
    return;
  }

  // Prisma known error codes
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      sendErrorResponse(res, 409, "That record already exists.");
      return;
    }
    if (err.code === "P2025") {
      sendErrorResponse(res, 404, "Record not found.");
      return;
    }
  }

  console.error("Unhandled error:", err);

  sendErrorResponse(
    res,
    500,
    config.app.env === "production"
      ? "Something went wrong. Please try again."
      : err instanceof Error
        ? err.message
        : "Something went wrong.",
  );
}
