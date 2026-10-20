"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { listSubmissionsQuerySchema, PAGINATION } from "@ph/shared";
import { useMe, useStats, useSubmissions } from "@/hooks";
import type { ListSubmissionsQuery } from "@/types";
import { Navbar } from "@/components/layout/navbar";
import { StatsCards } from "./stats-cards";
import { FilterPills } from "./filter-pills";
import { SubmissionsTable } from "./submissions-table";
import { PaginationNav } from "./pagination-nav";
import { Card } from "@/components/ui/card";

export function MentorOverview() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: user, isPending: userPending } = useMe();

  // Untrusted URL input → validated with the same shared schema the API uses.
  const parsed = listSubmissionsQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });
  const query: ListSubmissionsQuery = parsed.success
    ? parsed.data
    : { page: PAGINATION.DEFAULT_PAGE, limit: PAGINATION.DEFAULT_LIMIT, status: undefined };

  const { data: list, isPending: listPending } = useSubmissions(query);
  const { data: stats } = useStats();

  useEffect(() => {
    if (userPending) return;
    if (!user) router.replace("/login?next=/mentor");
    else if (user.role !== "MENTOR") router.replace("/dashboard");
  }, [user, userPending, router]);

  if (userPending || !user || user.role !== "MENTOR") {
    return (
      <main className="grid min-h-[70vh] place-items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading review dashboard...
        </div>
      </main>
    );
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <section>
          <h1 className="font-heading text-3xl font-semibold">Review_ Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Approve great work, reject what needs another pass — the students are waiting.
          </p>
        </section>

        {stats ? (
          <StatsCards stats={stats} />
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-secondary/50" />
            ))}
          </div>
        )}

        <section className="flex flex-wrap items-center justify-between gap-3">
          <FilterPills active={query.status ?? "ALL"} />
          <p className="text-sm text-muted-foreground">
            Filtering happens <span className="font-medium text-foreground">on the server</span> —
            change the URL and the data changes.
          </p>
        </section>

        <section className="space-y-4">
          {listPending && !list ? (
            <Card className="grid place-items-center border-dashed border-border/70 bg-card/50 py-16">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">Loading submissions...</p>
            </Card>
          ) : (
            <>
              <SubmissionsTable items={list?.items ?? []} />
              <PaginationNav
                pagination={
                  list?.meta ?? {
                    page: query.page,
                    limit: query.limit,
                    total: 0,
                    totalPages: 1,
                  }
                }
                status={query.status}
              />
            </>
          )}
        </section>
      </main>
    </>
  );
}
