"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSubmission,
  getMySubmissions,
  getStats,
  getSubmissions,
  reviewSubmission,
} from "@/api";
import type {
  CreateSubmissionInput,
  ListSubmissionsQuery,
  PaginationMeta,
  ReviewInput,
  Submission,
} from "@/types";

export function useMySubmissions(enabled = true) {
  return useQuery<Submission[]>({
    queryKey: ["submissions", "mine"],
    queryFn: async () => (await getMySubmissions()).data.submissions,
    enabled,
  });
}

export function useSubmissions(query: ListSubmissionsQuery) {
  return useQuery<{ items: Submission[]; meta: PaginationMeta }>({
    queryKey: ["submissions", "list", query],
    queryFn: async () => {
      const res = await getSubmissions(query);
      return {
        items: res.data.items,
        meta: res.meta ?? {
          page: query.page,
          limit: query.limit,
          total: res.data.items.length,
          totalPages: 1,
        },
      };
    },
    // Keep the previous page visible while the next one loads — no layout jump.
    placeholderData: (previous) => previous,
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => (await getStats()).data.stats,
    staleTime: 30_000,
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubmissionInput) => createSubmission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

export function useReviewSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewInput & { id: string }) => reviewSubmission(payload),
    onSuccess: () => {
      // The DB changed → both the table and the aggregated counters are stale.
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
