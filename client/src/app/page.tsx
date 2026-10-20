"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/navbar";

/** Where each role lands after login. */
export function homeFor(role: "STUDENT" | "MENTOR") {
  return role === "MENTOR" ? "/mentor" : "/dashboard";
}

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? homeFor(user.role) : "/login");
  }, [user, loading, router]);

  return (
    <main className="grid min-h-screen place-items-center starfield">
      <div className="flex flex-col items-center gap-4">
        <Logo size="lg" />
        <p className="font-heading text-lg text-muted-foreground">
          Loading your dashboard<span className="animate-pulse text-primary">_</span>
        </p>
      </div>
    </main>
  );
}
