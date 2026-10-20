"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Error boundary for the mentor section (Next.js `error.tsx` convention).
 * Receives the thrown error from the server component render or fetch.
 */
export default function MentorDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4">
      <Card className="max-w-md border-destructive/30 bg-card text-center">
        <CardHeader>
          <p className="text-4xl">💥</p>
          <CardTitle className="font-heading">Something went wrong</CardTitle>
          <CardDescription>
            {error.message || "The dashboard couldn't load your submissions."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={reset}
            className="bg-gradient-to-r from-primary to-[#7b2ff7] font-heading font-semibold glow-sm hover:opacity-90"
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
