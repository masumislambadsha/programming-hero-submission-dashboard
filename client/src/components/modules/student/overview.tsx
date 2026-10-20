"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useMe, useMySubmissions } from "@/hooks";
import { Navbar } from "@/components/layout/navbar";
import { SubmissionForm } from "./submission-form";
import { SubmissionCard } from "./submission-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StudentOverview() {
  const router = useRouter();
  const { data: user, isPending: userPending } = useMe();
  const { data: submissions = [], isPending: submissionsPending } = useMySubmissions(
    !!user && user.role === "STUDENT",
  );

  useEffect(() => {
    if (userPending) return;
    if (!user) router.replace("/login?next=/dashboard");
    else if (user.role === "MENTOR") router.replace("/mentor");
  }, [user, userPending, router]);

  if (userPending || !user || user.role !== "STUDENT") {
    return (
      <main className="grid min-h-[70vh] place-items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading your dashboard...
        </div>
      </main>
    );
  }

  const pending = submissions.filter((s) => s.status === "PENDING").length;
  const approved = submissions.filter((s) => s.status === "APPROVED").length;

  return (
    <>
      <Navbar />

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

            {submissionsPending ? (
              <Card className="border-dashed border-border/70 bg-card/50">
                <CardContent className="grid place-items-center py-12 text-center">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">Loading your submissions...</p>
                </CardContent>
              </Card>
            ) : submissions.length === 0 ? (
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
