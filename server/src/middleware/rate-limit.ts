import rateLimit from "express-rate-limit";

const json = (message: string) => ({
  success: false,
  message,
});

/**
 * Global limiter — soft protection against scripted abuse of the whole API.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
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
  windowMs: 15 * 60 * 1000,
  limit: 5,
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
