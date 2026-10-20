import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError";

/**
 * Reference-style validation middleware. Schemas are wrapped as
 * `{ body, query, params }` so one middleware validates the whole request.
 *
 * The actual field rules live in @ph/shared — the exact same Zod schemas the
 * client runs — so client and server can never disagree.
 *
 * On success the parsed values are attached to `req.validated` (transforms and
 * coercions applied, unlike raw req.body/req.query).
 */
export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        // Drop the "body"/"query"/"params" container from the field path so
        // the client can map errors straight onto form fields.
        const path = issue.path.filter((part) => !["body", "query", "params"].includes(String(part)));
        const key = path.join(".") || "_";
        (errors[key] ??= []).push(issue.message);
      }

      return next(
        new AppError(422, "Validation failed. Please fix the highlighted fields.", errors),
      );
    }

    req.validated = result.data as Request["validated"];
    next();
  };
}
