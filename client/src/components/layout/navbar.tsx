"use client";

import Link from "next/link";
import { useMe, useLogout } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** PH logomark — swap with the official asset from Brandfetch if you like. */
export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span
      className={`grid ${size === "lg" ? "size-11 text-lg" : "size-9 text-sm"} place-items-center rounded-xl bg-gradient-to-br from-primary to-[#7b2ff7] font-heading font-bold text-white glow-sm`}
    >
      PH
    </span>
  );
}

export function Navbar() {
  const { data: user, isPending } = useMe();
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Logo />
          <span className="flex flex-col leading-tight">
            <span className="font-heading text-sm font-semibold text-foreground sm:text-base">
              Programming Hero
            </span>
            <span className="text-[11px] text-muted-foreground">
              Project_ Submissions
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isPending || !user ? (
            <div className="h-8 w-40 animate-pulse rounded-lg bg-secondary/50" />
          ) : (
            <>
              <div className="hidden flex-col items-end leading-tight sm:flex">
                <span className="text-sm font-medium text-foreground">{user.name}</span>
                <span className="text-[11px] text-muted-foreground">{user.email}</span>
              </div>
              <Badge
                variant="outline"
                className={
                  user.role === "MENTOR"
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-success/40 bg-success/10 text-success"
                }
              >
                {user.role === "MENTOR" ? "🧑‍🏫 Mentor" : "👨‍🎓 Student"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                className="border-border hover:border-primary/50 hover:text-primary"
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
