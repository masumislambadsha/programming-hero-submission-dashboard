import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import type { CreateSubmissionInput, ListSubmissionsQuery, ReviewInput } from "./submission.interface";
import { SubmissionService } from "./submission.service";

/** POST /api/v1/submissions — student only. */
const create = catchAsync(async (req: Request, res: Response) => {
  const submission = await SubmissionService.createSubmission(
    req.user!.id,
    req.validated?.body as CreateSubmissionInput,
  );

  sendResponse(res, {
    statusCode: 201,
    message: "Project submitted successfully.",
    data: { submission },
  });
});

/** GET /api/v1/submissions/mine — a student's own submissions (any status). */
const listMine = catchAsync(async (req: Request, res: Response) => {
  const submissions = await SubmissionService.listMine(req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    message: "Your submissions were fetched successfully.",
    data: { submissions },
  });
});

/** GET /api/v1/submissions?status=PENDING&page=1&limit=10 — mentor only. */
const listAll = catchAsync(async (req: Request, res: Response) => {
  const query = req.validated?.query as ListSubmissionsQuery;
  const { items, meta } = await SubmissionService.listAll(query);

  sendResponse(res, {
    statusCode: 200,
    message: "Submissions were fetched successfully.",
    data: { items },
    meta,
  });
});

/** GET /api/v1/submissions/stats — aggregated counts (cached ~30s). */
const stats = catchAsync(async (_req: Request, res: Response) => {
  const statsData = await SubmissionService.getStats();

  sendResponse(res, {
    statusCode: 200,
    message: "Stats were fetched successfully.",
    data: { stats: statsData },
  });
});

/** PATCH /api/v1/submissions/:id/review — approve or reject. */
const review = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.validated?.params as { id: string };
  const submission = await SubmissionService.reviewSubmission(
    id,
    req.user!.id,
    req.validated?.body as ReviewInput,
  );

  sendResponse(res, {
    statusCode: 200,
    message: `Submission ${submission.status.toLowerCase()} successfully.`,
    data: { submission },
  });
});

export const SubmissionController = {
  create,
  listMine,
  listAll,
  stats,
  review,
};
