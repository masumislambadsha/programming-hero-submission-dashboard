"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks";
import { homeFor } from "@/lib/roles";
import { Logo } from "@/components/layout/navbar";

export default function RootPage() {
  const router = useRouter();
  const { data: user, isPending } = useMe();

  useEffect(() => {
    if (isPending) return;
    router.replace(user ? homeFor(user.role) : "/login");
  }, [user, isPending, router]);

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
