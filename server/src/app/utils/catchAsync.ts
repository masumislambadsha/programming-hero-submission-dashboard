import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Wraps an async controller so a rejected promise is forwarded to the global
 * error handler instead of crashing the process or hanging the request.
 */
export const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => unknown): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
