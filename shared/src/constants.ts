/**
 * Domain constants shared by client and server.
 *
 * These mirror the Prisma enums (see server/prisma/schema.prisma) but stay
 * framework-free so the client never needs to import Prisma types.
 */

export const ROLES = ["STUDENT", "MENTOR"] as const;
export type Role = (typeof ROLES)[number];

export const SUBMISSION_STATUS = ["PENDING", "APPROVED", "REJECTED"] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUS)[number];

/** Statuses a mentor can set when reviewing a submission. */
export const REVIEWABLE_STATUSES = ["APPROVED", "REJECTED"] as const;
export type ReviewableStatus = (typeof REVIEWABLE_STATUSES)[number];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
} as const;
