import type { Role, SubmissionStatus } from "./constants";

/** The only user shape that ever leaves the API — never includes passwordHash. */
export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type SubmissionFeedback = {
  id: string;
  comment: string;
  createdAt: string;
  reviewer: { name: string };
};

export type Submission = {
  id: string;
  projectName: string;
  repoUrl: string;
  liveUrl: string | null;
  description: string;
  status: SubmissionStatus;
  reviewedAt: string | null;
  createdAt: string;
  feedback: SubmissionFeedback[];
  student?: { id: string; name: string; email: string };
  reviewer?: { id: string; name: string } | null;
  _count?: { feedback: number };
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Stats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};
