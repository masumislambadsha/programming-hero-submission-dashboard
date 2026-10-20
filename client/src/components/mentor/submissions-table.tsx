import Link from "next/link";
import type { Submission } from "@ph/shared";
import { StatusBadge } from "@/components/status-badge";
import { ReviewActions } from "@/components/mentor/review-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function SubmissionsTable({ items }: { items: Submission[] }) {
  if (items.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-border/70 bg-card/50 py-16 text-center">
        <p className="text-4xl">🔍</p>
        <p className="mt-3 font-heading font-medium">Nothing here</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No submissions match this filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border/70 hover:bg-transparent">
            <TableHead className="pl-5 text-muted-foreground">Student</TableHead>
            <TableHead className="text-muted-foreground">Project</TableHead>
            <TableHead className="hidden md:table-cell text-muted-foreground">Submitted</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="pr-5 text-right text-muted-foreground">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((s) => (
            <TableRow key={s.id} className="border-border/50 transition-colors hover:bg-primary/5">
              <TableCell className="pl-5">
                <p className="font-medium">{s.student?.name}</p>
                <p className="text-xs text-muted-foreground">{s.student?.email}</p>
              </TableCell>
              <TableCell>
                <a
                  href={s.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm font-medium text-foreground hover:text-primary hover:underline"
                >
                  {s.projectName} ↗
                </a>
                {s.liveUrl && (
                  <a
                    href={s.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-xs text-primary/80 hover:underline"
                  >
                    live
                  </a>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                {formatDate(s.createdAt)}
                {s.reviewer && s.status !== "PENDING" && (
                  <p className="text-xs">
                    by <span className="text-foreground/80">{s.reviewer.name}</span>
                  </p>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={s.status} />
              </TableCell>
              <TableCell className="pr-5 text-right">
                {s.status === "PENDING" ? (
                  <div className="flex justify-end gap-2">
                    <ReviewActions
                      submissionId={s.id}
                      projectName={s.projectName}
                      action="APPROVED"
                    />
                    <ReviewActions
                      submissionId={s.id}
                      projectName={s.projectName}
                      action="REJECTED"
                    />
                  </div>
                ) : (
                  <Link
                    href={`/mentor?status=${s.status}`}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    reviewed {s.reviewedAt ? formatDate(s.reviewedAt) : ""}
                  </Link>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
