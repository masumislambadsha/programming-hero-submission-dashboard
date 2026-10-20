import type {
  CreateSubmissionInput,
  ListSubmissionsQuery,
  PaginationMeta,
  ReviewInput,
  Submission,
} from "@ph/shared";

export type {
  CreateSubmissionInput,
  ListSubmissionsQuery,
  PaginationMeta,
  ReviewInput,
  Submission,
};

export type Stats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export type SubmissionListResult = {
  items: Submission[];
  meta: PaginationMeta;
};
