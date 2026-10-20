import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SubmissionStatus } from "@ph/shared";

const filters = [
  { label: "All", value: "ALL", accent: "text-foreground" },
  { label: "Pending", value: "PENDING", accent: "text-warning" },
  { label: "Approved", value: "APPROVED", accent: "text-success" },
  { label: "Rejected", value: "REJECTED", accent: "text-danger" },
] as const;

/**
 * Server-side filtering, client-side nicety: each pill is a plain <Link>
 * that writes `?status=` into the URL. The page (a Server Component) re-reads
 * searchParams and asks the API to filter — no JS required for it to work.
 */
export function FilterPills({ active }: { active: SubmissionStatus | "ALL" }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f) => {
        const isActive = active === f.value;
        return (
          <Link
            key={f.value}
            href={f.value === "ALL" ? "/mentor" : `/mentor?status=${f.value}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
              isActive
                ? "border-primary/60 bg-primary/15 text-primary glow-sm"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {f.label}
          </Link>
        );
      })}
    </div>
  );
}
