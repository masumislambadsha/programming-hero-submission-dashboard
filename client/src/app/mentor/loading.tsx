import { Skeleton } from "@/components/ui/skeleton";

/** Shown automatically inside a Suspense boundary while the page renders. */
export default function MentorDashboardLoading() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64 bg-secondary/60" />
        <Skeleton className="h-4 w-96 max-w-full bg-secondary/40" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl bg-secondary/60" />
        ))}
      </div>

      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full bg-secondary/60" />
        ))}
      </div>

      <Skeleton className="h-80 rounded-2xl bg-secondary/50" />
    </main>
  );
}
