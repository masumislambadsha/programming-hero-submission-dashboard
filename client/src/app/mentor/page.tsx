import { redirect } from "next/navigation";
import { listSubmissionsQuerySchema, PAGINATION } from "@ph/shared";
import type { PaginationMeta, Stats, Submission } from "@ph/shared";
import { serverApi, getCurrentUser } from "@/lib/server-api";
import { Navbar } from "@/components/navbar";
import { StatsCards } from "@/components/mentor/stats-cards";
import { FilterPills } from "@/components/mentor/filter-pills";
import { SubmissionsTable } from "@/components/mentor/submissions-table";
import { PaginationNav } from "@/components/mentor/pagination-nav";

export const metadata = { title: "Review Dashboard" };

/**
 * The mentor dashboard is a Server Component driven by the URL:
 *
 *   /mentor?status=PENDING&page=2
 *
 * `searchParams` is a Promise in Next.js 16 — awaiting it opts this page into
 * dynamic rendering, so filters and pagination are handled SERVER-SIDE by the
 * database (Prisma skip/take + WHERE), never by slicing arrays in the browser.
 */
export default async function MentorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=/mentor");
  if (user.role !== "MENTOR") redirect("/dashboard");

  // Untrusted URL input → validated with the same shared schema the API uses.
  const parsed = listSubmissionsQuerySchema.safeParse(await searchParams);
  const query = parsed.success
    ? parsed.data
    : { page: PAGINATION.DEFAULT_PAGE, limit: PAGINATION.DEFAULT_LIMIT, status: undefined };

  const [{ stats }, list] = await Promise.all([
    serverApi<{ stats: Stats }>("/api/submissions/stats"),
    serverApi<{ items: Submission[]; pagination: PaginationMeta }>(
      `/api/submissions?page=${query.page}&limit=${query.limit}${query.status ? `&status=${query.status}` : ""}`,
    ),
  ]);

  return (
    <>
      <Navbar user={user} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <section>
          <h1 className="font-heading text-3xl font-semibold">
            Review_ Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Approve great work, reject what needs another pass — the students are waiting.
          </p>
        </section>

        <StatsCards stats={stats} />

        <section className="flex flex-wrap items-center justify-between gap-3">
          <FilterPills active={query.status ?? "ALL"} />
          <p className="text-sm text-muted-foreground">
            Filtering happens <span className="font-medium text-foreground">on the server</span> —
            change the URL and the data changes.
          </p>
        </section>

        <section className="space-y-4">
          <SubmissionsTable items={list.items} />
          <PaginationNav pagination={list.pagination} status={query.status} />
        </section>
      </main>
    </>
  );
}
