import { cn } from "@/lib/utils";
import type { SubmissionStatus } from "@/types";

const styles: Record<SubmissionStatus, { dot: string; chip: string; label: string }> = {
  PENDING: {
    dot: "bg-warning",
    chip: "border-warning/30 bg-warning/10 text-warning",
    label: "Pending",
  },
  APPROVED: {
    dot: "bg-success",
    chip: "border-success/30 bg-success/10 text-success",
    label: "Approved",
  },
  REJECTED: {
    dot: "bg-danger",
    chip: "border-danger/30 bg-danger/10 text-danger",
    label: "Rejected",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: SubmissionStatus;
  className?: string;
}) {
  const s = styles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        s.chip,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
