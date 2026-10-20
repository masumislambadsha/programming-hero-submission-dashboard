import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56 bg-secondary/60" />
        <Skeleton className="h-4 w-80 max-w-full bg-secondary/40" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Skeleton className="h-[28rem] rounded-2xl bg-secondary/60" />
        <div className="space-y-4">
          <Skeleton className="h-7 w-44 bg-secondary/60" />
          <Skeleton className="h-36 rounded-2xl bg-secondary/50" />
          <Skeleton className="h-36 rounded-2xl bg-secondary/50" />
        </div>
      </div>
    </main>
  );
}
