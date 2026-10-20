import Link from "next/link";
import type { PaginationMeta, SubmissionStatus } from "@ph/shared";
import { Button } from "@/components/ui/button";

/** Prev/Next links that preserve the active status filter in the URL. */
export function PaginationNav({
  pagination,
  status,
}: {
  pagination: PaginationMeta;
  status?: SubmissionStatus;
}) {
  const { page, totalPages, total } = pagination;
  const hrefFor = (p: number) =>
    `/mentor${status ? `?status=${status}` : ""}${status ? "&" : "?"}page=${p}`;

  return (
    <div className="flex items-center justify-between gap-4 pt-2">
      <p className="text-sm text-muted-foreground">
        Showing page <span className="font-medium text-foreground">{page}</span> of{" "}
        <span className="font-medium text-foreground">{totalPages}</span> · {total} submissions
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Button
            render={<Link href={hrefFor(page - 1)} />}
            variant="outline"
            size="sm"
            className="border-border hover:border-primary/40 hover:text-primary"
          >
            ← Prev
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled className="border-border">
            ← Prev
          </Button>
        )}
        {page < totalPages ? (
          <Button
            render={<Link href={hrefFor(page + 1)} />}
            variant="outline"
            size="sm"
            className="border-border hover:border-primary/40 hover:text-primary"
          >
            Next →
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled className="border-border">
            Next →
          </Button>
        )}
      </div>
    </div>
  );
}
