import { Router } from "express";
import { createSubmissionSchema, listSubmissionsQuerySchema, reviewSchema } from "@ph/shared";
import { requireAuth, requireRole } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import { submissionLimiter } from "../middleware/rate-limit";
import * as submissionService from "../services/submission.service";

export const submissionRouter = Router();

/* ------------------------------- Student ------------------------------- */

/**
 * POST /api/submissions
 * Order matters: authenticate → authorize → rate-limit → validate → write.
 */
submissionRouter.post(
  "/",
  requireAuth,
  requireRole("STUDENT"),
  submissionLimiter,
  validateBody(createSubmissionSchema),
  async (req, res) => {
    const submission = await submissionService.createSubmission(req.user!.id, req.body);
    res.status(201).json({ success: true, data: { submission } });
  },
);

/** GET /api/submissions/mine — a student's own submissions (any status). */
submissionRouter.get(
  "/mine",
  requireAuth,
  requireRole("STUDENT"),
  async (req, res) => {
    const submissions = await submissionService.listMine(req.user!.id);
    res.json({ success: true, data: { submissions } });
  },
);

/* -------------------------------- Mentor -------------------------------- */

/** GET /api/submissions?status=PENDING&page=1&limit=10 — server-side filter + pagination. */
submissionRouter.get(
  "/",
  requireAuth,
  requireRole("MENTOR"),
  validateQuery(listSubmissionsQuerySchema),
  async (req, res) => {
    const query = (req as typeof req & { parsedQuery: import("@ph/shared").ListSubmissionsQuery })
      .parsedQuery;
    const result = await submissionService.listAll(query);
    res.json({ success: true, data: result });
  },
);

/** GET /api/submissions/stats — aggregated counts (cached ~30s, invalidated on writes). */
submissionRouter.get("/stats", requireAuth, requireRole("MENTOR"), async (_req, res) => {
  const stats = await submissionService.getStats();
  res.json({ success: true, data: { stats } });
});

/**
 * PATCH /api/submissions/:id/review — approve or reject.
 * The service re-verifies the submission exists before mutating anything.
 */
submissionRouter.patch(
  "/:id/review",
  requireAuth,
  requireRole("MENTOR"),
  validateBody(reviewSchema),
  async (req, res) => {
    // Express 5 types params as string | string[] (repeated wildcards).
    const submissionId = String(req.params.id);
    const submission = await submissionService.reviewSubmission(
      submissionId,
      req.user!.id,
      req.body,
    );
    res.json({ success: true, data: { submission } });
  },
);
