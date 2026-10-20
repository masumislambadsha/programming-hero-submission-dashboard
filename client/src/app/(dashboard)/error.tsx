"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Error boundary shared by the dashboard route group. */
export default function DashboardError({
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
            {error.message || "The dashboard couldn't load."}
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
