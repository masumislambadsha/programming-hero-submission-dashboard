import Link from "next/link";
import { redirect } from "next/navigation";
import type { Submission } from "@ph/shared";
import { serverApi, getCurrentUser } from "@/lib/server-api";
import { Navbar } from "@/components/navbar";
import { SubmissionForm } from "@/components/submission-form";
import { SubmissionCard } from "@/components/submission-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "My Dashboard" };

/**
 * Server Component by default (Next.js App Router):
 * - auth + data fetching happen on the server, close to the database
 * - the API token never reaches the browser for this render
 * - only <SubmissionForm/> hydrates as a client component (it needs
 *   event handlers and state — a form is the textbook use case)
 */
export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=/dashboard");
  if (user.role === "MENTOR") redirect("/mentor");

  const { submissions } = await serverApi<{ submissions: Submission[] }>(
    "/api/submissions/mine",
  );

  const pending = submissions.filter((s) => s.status === "PENDING").length;
  const approved = submissions.filter((s) => s.status === "APPROVED").length;

  return (
    <>
      <Navbar user={user} />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-semibold">
              Hey {user.name.split(" ")[0]} <span className="text-primary">_</span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              Submit your project and let your mentor review it.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl border border-border/70 bg-card px-4 py-2 text-center">
              <p className="font-heading text-2xl font-semibold text-warning">{pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card px-4 py-2 text-center">
              <p className="font-heading text-2xl font-semibold text-success">{approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <SubmissionForm />

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold">My_ Submissions</h2>
              <Badge variant="secondary">{submissions.length} total</Badge>
            </div>

            {submissions.length === 0 ? (
              <Card className="border-dashed border-border/70 bg-card/50">
                <CardContent className="grid place-items-center py-12 text-center">
                  <p className="text-4xl">🛸</p>
                  <p className="mt-3 font-heading font-medium">No submissions yet</p>
                  <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    Fill out the form and send your first project into orbit.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ul className="space-y-4">
                {submissions.map((s) => (
                  <li key={s.id}>
                    <SubmissionCard submission={s} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          Built with Next.js + Express + Prisma ·{" "}
          <Link href="/login" className="hover:text-primary">
            Programming Hero Web Instructor task
          </Link>
        </footer>
      </main>
    </>
  );
}
