import type {
  ApiSuccess,
  CreateSubmissionInput,
  ListSubmissionsQuery,
  PaginationMeta,
  ReviewInput,
  Stats,
  Submission,
} from "@/types";
import apiClient from "@/lib/apiClient";

export function getMySubmissions() {
  return apiClient<ApiSuccess<{ submissions: Submission[] }>>("/submissions/mine");
}

export function createSubmission(payload: CreateSubmissionInput) {
  return apiClient<ApiSuccess<{ submission: Submission }>>("/submissions", {
    method: "POST",
    body: payload,
  });
}

export function getSubmissions(query: ListSubmissionsQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });
  if (query.status) params.set("status", query.status);

  return apiClient<ApiSuccess<{ items: Submission[] }, PaginationMeta>>(
    `/submissions?${params.toString()}`,
  );
}

export function getStats() {
  return apiClient<ApiSuccess<{ stats: Stats }>>("/submissions/stats");
}

export function reviewSubmission({
  id,
  ...payload
}: ReviewInput & { id: string }) {
  return apiClient<ApiSuccess<{ submission: Submission }>>(
    `/submissions/${id}/review`,
    { method: "PATCH", body: payload },
  );
}
