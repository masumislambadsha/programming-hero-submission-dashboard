import { normalizeRepoUrl, PAGINATION } from "@ph/shared";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { calculatePagination } from "../../utils/pagination";
import type {
  CreateSubmissionInput,
  ListSubmissionsQuery,
  ReviewInput,
  Stats,
  Submission,
  SubmissionListResult,
} from "./submission.interface";

/* ------------------------------------------------------------------ */
/* Stats cache (see video topic: caching architecture)                 */
/* ------------------------------------------------------------------ */

const STATS_TTL_MS = 30_000;
let statsCache: { value: Stats; expiresAt: number } | null = null;

/** Called on every write so the cache is never stale beyond one read. */
export function invalidateStatsCache() {
  statsCache = null;
}

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

export async function getStats(): Promise<Stats> {
  if (statsCache && statsCache.expiresAt > Date.now()) {
    return statsCache.value;
  }

  const [total, pending, approved, rejected] = await Promise.all([
    prisma.submission.count(),
    prisma.submission.count({ where: { status: "PENDING" } }),
    prisma.submission.count({ where: { status: "APPROVED" } }),
    prisma.submission.count({ where: { status: "REJECTED" } }),
  ]);

  const value: Stats = { total, pending, approved, rejected };
  statsCache = { value, expiresAt: Date.now() + STATS_TTL_MS };
  return value;
}

export async function listMine(studentId: string) {
  return prisma.submission.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      projectName: true,
      repoUrl: true,
      liveUrl: true,
      description: true,
      status: true,
      reviewedAt: true,
      createdAt: true,
      feedback: {
        select: { id: true, comment: true, createdAt: true, reviewer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function listAll(query: ListSubmissionsQuery): Promise<SubmissionListResult> {
  const page = query.page ?? PAGINATION.DEFAULT_PAGE;
  const limit = query.limit ?? PAGINATION.DEFAULT_LIMIT;

  // ✅ Server-side filtering: the WHERE clause is built here, in the
  // database layer — never by slicing a pre-fetched array in the client.
  const where = query.status ? { status: query.status } : {};

  const [rows, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        student: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true } },
        _count: { select: { feedback: true } },
      },
    }),
    prisma.submission.count({ where }),
  ]);

  // Dates become ISO strings over the wire; map explicitly so the service
  // return type matches the shared `Submission` contract exactly.
  const items: Submission[] = rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
  }));

  return { items, meta: calculatePagination(total, page, limit) };
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

export async function createSubmission(studentId: string, input: CreateSubmissionInput) {
  const repoUrl = normalizeRepoUrl(input.repoUrl);

  // Friendly pre-check… the DB unique constraint remains the guarantee.
  const duplicate = await prisma.submission.findUnique({
    where: { studentId_repoUrl: { studentId, repoUrl } },
    select: { id: true, projectName: true },
  });

  if (duplicate) {
    throw new AppError(
      409,
      `You already submitted "${duplicate.projectName}" with this repository URL. Edit is not allowed — contact your mentor if something is wrong.`,
      { repoUrl: ["This repository has already been submitted"] },
    );
  }

  try {
    const submission = await prisma.submission.create({
      data: {
        projectName: input.projectName,
        repoUrl,
        liveUrl: input.liveUrl ? normalizeRepoUrl(input.liveUrl) : null,
        description: input.description,
        studentId,
      },
    });
    invalidateStatsCache();
    return submission;
  } catch (err) {
    // Race: two identical requests passed the check above at the same time.
    // Prisma P2002 (unique violation) is our real safety net.
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      throw new AppError(409, "You already submitted this repository URL.", {
        repoUrl: ["This repository has already been submitted"],
      });
    }
    throw err;
  }
}

export async function reviewSubmission(
  submissionId: string,
  reviewerId: string,
  input: ReviewInput,
) {
  // Verify the resource exists BEFORE any mutation (the "definitive
  // verification" every secured route must do).
  const existing = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { id: true, status: true },
  });

  if (!existing) {
    throw new AppError(404, "This submission no longer exists.");
  }

  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: input.status,
      reviewerId,
      reviewedAt: new Date(),
      // Feedback is written in the same transaction as the status change.
      ...(input.note
        ? { feedback: { create: { comment: input.note, reviewerId } } }
        : {}),
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      reviewer: { select: { id: true, name: true } },
    },
  });

  invalidateStatsCache();
  return submission;
}

export const SubmissionService = {
  getStats,
  listMine,
  listAll,
  createSubmission,
  reviewSubmission,
  invalidateStatsCache,
};
