import type { NextFunction, Request, Response } from "express";
import { sendErrorResponse } from "../utils/sendResponse";

/** 404 for unmatched API routes. */
export function notFound(req: Request, res: Response, _next: NextFunction): void {
  sendErrorResponse(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}
