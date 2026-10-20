export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Single source of truth for the pagination meta returned by list endpoints. */
export function calculatePagination(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/** Clamps untrusted page/limit strings into safe bounds (1-based). */
export function parsePageParams(
  pageStr?: string,
  limitStr?: string,
): { page: number; limit: number; skip: number } {
  const page = Math.max(1, Number(pageStr) || 1);
  const limit = Math.min(50, Math.max(1, Number(limitStr) || 10));
  return { page, limit, skip: (page - 1) * limit };
}
