import type { Response } from "express";

interface SendResponseOptions {
  statusCode: number;
  message: string;
  data?: unknown;
  meta?: unknown;
}

/** Uniform success envelope: { success, message, data, meta }. */
export function sendResponse(
  res: Response,
  { statusCode, message, data, meta }: SendResponseOptions,
): void {
  res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
    meta: meta ?? null,
  });
}

/** Uniform error envelope: { success, message, errors }. */
export function sendErrorResponse(
  res: Response,
  statusCode: number,
  message: string,
  errors?: Record<string, string[]> | null,
): void {
  res.status(statusCode).json({
    success: false,
    message,
    errors: errors ?? null,
  });
}
