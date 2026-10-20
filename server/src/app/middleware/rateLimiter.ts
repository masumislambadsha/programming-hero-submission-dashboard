import rateLimit from "express-rate-limit";
import config from "../config";

const json = (message: string) => ({
  success: false,
  message,
});

/**
 * Global limiter — soft protection against scripted abuse of the whole API.
 */
export const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.globalMax,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json(json("Too many requests. Please slow down and try again shortly.")),
});

/**
 * Strict limiter for the submission form — the spam target.
 *
 * Keyed by authenticated user id (falling back to IP), so one noisy student
 * cannot exhaust the budget of everyone behind the same NAT/proxy.
 */
export const submissionLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.submissionMax,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? "unknown",
  handler: (_req, res) =>
    res.status(429).json(
      json(
        "You've submitted too many times in a short while. Please wait 15 minutes and try again.",
      ),
    ),
});

export const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json(json("Too many login attempts. Please try again in a few minutes.")),
});
