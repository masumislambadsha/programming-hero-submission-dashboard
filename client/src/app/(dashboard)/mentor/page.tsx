import type { Metadata } from "next";
import { Suspense } from "react";
import { MentorOverview } from "@/components/modules/mentor/overview";

export const metadata: Metadata = {
  title: "Review Dashboard",
  description: "Approve or reject student submissions and track review stats.",
};

export default function MentorDashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-[70vh] place-items-center">
          <p className="text-sm text-muted-foreground">Loading review dashboard...</p>
        </main>
      }
    >
      <MentorOverview />
    </Suspense>
  );
}
