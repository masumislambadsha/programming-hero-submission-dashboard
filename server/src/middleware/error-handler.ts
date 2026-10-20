import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { env } from "../env";
import { HttpError } from "../lib/http-error";

/** 404 for unmatched API routes. */
export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, message: "Route not found." });
}

/**
 * Central error handler — the last line of defense.
 *
 * Translates known error types into stable API responses and guarantees we
 * never leak stack traces or internal messages to clients in production.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Expected business-logic errors (duplicates, missing records, …)
  if (err instanceof HttpError) {
    return res
      .status(err.status)
      .json({ success: false, message: err.message, errors: err.errors });
  }
  // Zod (thrown, not passed through validate middleware)
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "_";
      (errors[key] ??= []).push(issue.message);
    }
    return res.status(422).json({
      success: false,
      message: "Validation failed.",
      errors,
    });
  }

  // Prisma known error codes
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "That record already exists.",
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Record not found.",
      });
    }
  }

  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === "production"
        ? "Something went wrong. Please try again."
        : err instanceof Error
          ? err.message
          : "Something went wrong.",
  });
}
