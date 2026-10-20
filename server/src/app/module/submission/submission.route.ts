import { Router } from "express";
import { checkAuth, requireRole } from "../../middleware/checkAuth";
import { submissionLimiter } from "../../middleware/rateLimiter";
import { validate } from "../../middleware/validate";
import { SubmissionController } from "./submission.controller";
import {
  createSubmissionValidation,
  listSubmissionsValidation,
  reviewValidation,
} from "./submission.validation";

const router = Router();

/* ------------------------------- Student ------------------------------- */

/**
 * Order matters: authenticate → authorize → rate-limit → validate → write.
 */
router.post(
  "/",
  checkAuth,
  requireRole("STUDENT"),
  submissionLimiter,
  validate(createSubmissionValidation),
  SubmissionController.create,
);

router.get("/mine", checkAuth, requireRole("STUDENT"), SubmissionController.listMine);

/* -------------------------------- Mentor -------------------------------- */

router.get(
  "/stats",
  checkAuth,
  requireRole("MENTOR"),
  SubmissionController.stats,
);

router.get(
  "/",
  checkAuth,
  requireRole("MENTOR"),
  validate(listSubmissionsValidation),
  SubmissionController.listAll,
);

router.patch(
  "/:id/review",
  checkAuth,
  requireRole("MENTOR"),
  validate(reviewValidation),
  SubmissionController.review,
);

export const submissionRoutes = router;
