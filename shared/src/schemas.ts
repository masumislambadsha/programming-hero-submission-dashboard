import { z } from "zod";
import { REVIEWABLE_STATUSES, SUBMISSION_STATUS, PAGINATION } from "./constants";

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Only students can self-signup. Mentors/admins are seeded directly in the
 * database — the `role` field is intentionally NOT part of this schema so a
 * client can never request a privileged role.
 */
export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be at most 60 characters"),
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});
export type SignupInput = z.infer<typeof signupSchema>;

/* ------------------------------------------------------------------ */
/* Submissions                                                         */
/* ------------------------------------------------------------------ */

/**
 * Repo + live URLs must be plain http(s) URLs. Normalization (trailing
 * slashes, `.git` suffix, casing) happens server-side via
 * `normalizeRepoUrl()` before the duplicate check.
 */
const httpUrl = z.url({
  protocol: /^https?$/,
  error:
    "Must be a valid http(s) URL (e.g. https://github.com/user/repo)",
});

export const createSubmissionSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name must be at most 100 characters"),
  repoUrl: httpUrl,
  liveUrl: z
    .union([httpUrl, z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  description: z
    .string()
    .trim()
    .min(20, "Describe your project in at least 20 characters")
    .max(1000, "Description must be at most 1000 characters"),
});
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;

/** Mentor review action — never PENDING, that would not be a review. */
export const reviewSchema = z.object({
  status: z.enum(REVIEWABLE_STATUSES, "Status must be APPROVED or REJECTED"),
  note: z
    .string()
    .trim()
    .max(500, "Note must be at most 500 characters")
    .optional(),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

/* ------------------------------------------------------------------ */
/* Query strings (mentor dashboard)                                    */
/* ------------------------------------------------------------------ */

export const listSubmissionsQuerySchema = z.object({
  page: z.coerce
    .number()
    .int("Page must be an integer")
    .min(1, "Page must be at least 1")
    .default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(PAGINATION.MAX_LIMIT, `Limit must be at most ${PAGINATION.MAX_LIMIT}`)
    .default(PAGINATION.DEFAULT_LIMIT),
  /** Omitted / "ALL" means no status filter. */
  status: z
    .enum(SUBMISSION_STATUS)
    .optional()
    .or(z.literal("ALL").transform(() => undefined)),
});
export type ListSubmissionsQuery = z.infer<typeof listSubmissionsQuerySchema>;

/* ------------------------------------------------------------------ */
/* API envelope                                                        */
/* ------------------------------------------------------------------ */

export type ApiError = {
  success: false;
  message: string;
  /** Field-level errors, keyed by input field — surfaced by the forms. */
  errors?: Record<string, string[]>;
};

export type ApiSuccess<T, M = unknown> = {
  success: true;
  message: string;
  data: T;
  meta?: M | null;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
