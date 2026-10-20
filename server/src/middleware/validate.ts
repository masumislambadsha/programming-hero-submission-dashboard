import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

/**
 * Body validation middleware. The schema comes from @ph/shared — the exact
 * same rules the frontend uses — so client and server can never disagree.
 *
 * On failure it responds 422 with per-field messages, shaped like the ApiError
 * envelope the frontend maps onto form fields.
 */
export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || "_";
        (errors[key] ??= []).push(issue.message);
      }
      return res.status(422).json({
        success: false,
        message: "Validation failed. Please fix the highlighted fields.",
        errors,
      });
    }

    req.body = result.data;
    next();
  };
}

/** Same contract as validateBody, for query strings. */
export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || "_";
        (errors[key] ??= []).push(issue.message);
      }
      return res.status(422).json({
        success: false,
        message: "Invalid query parameters.",
        errors,
      });
    }

    // Stash parsed values — do not trust raw req.query afterwards.
    (req as Request & { parsedQuery?: unknown }).parsedQuery = result.data;
    next();
  };
}
