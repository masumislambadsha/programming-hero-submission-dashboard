import { z } from "zod";
import {
  createSubmissionSchema,
  listSubmissionsQuerySchema,
  reviewSchema,
} from "@ph/shared";

/** Request wrappers for the validate middleware (rules live in @ph/shared). */
export const createSubmissionValidation = z.object({
  body: createSubmissionSchema,
});

export const listSubmissionsValidation = z.object({
  query: listSubmissionsQuerySchema,
});

export const reviewValidation = z.object({
  body: reviewSchema,
  params: z.object({ id: z.string().min(1, "Submission id is required") }),
});
