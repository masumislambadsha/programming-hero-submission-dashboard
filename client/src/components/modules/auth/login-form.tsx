"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { loginSchema } from "@ph/shared";
import { demoLogin, seedMe, useLogin, useMe } from "@/hooks";
import { ApiRequestError } from "@/lib/apiClient";
import { homeFor } from "@/lib/roles";
import type { SafeUser } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type FieldErrors = Record<string, string[]>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: currentUser } = useMe();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [demoPending, setDemoPending] = useState<"STUDENT" | "MENTOR" | null>(null);

  // Already signed in (e.g. opened /login directly) — go home.
  useEffect(() => {
    if (currentUser) router.replace(homeFor(currentUser.role));
  }, [currentUser, router]);

  /** Shared post-login step: same-site redirect + already-seeded user cache. */
  function finishLogin(user: SafeUser) {
    toast.success(`Welcome back, ${user.name.split(" ")[0]}! 🚀`);
    const next = searchParams.get("next");
    // Only allow same-site redirects (never an absolute URL from the query).
    const target = next && next.startsWith("/") && !next.startsWith("//") ? next : homeFor(user.role);
    router.replace(target);
  }

  /** One-click login for the seeded demo accounts (handy for reviewers). */
  async function quickLogin(role: "STUDENT" | "MENTOR") {
    setErrors({});
    setDemoPending(role);

    try {
      const user = await demoLogin(role);
      seedMe(queryClient, user);
      finishLogin(user);
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Something went wrong.");
      setDemoPending(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    // 1) Client-side check with the SAME schema the server uses.
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        (fieldErrors[issue.path.join(".")] ??= []).push(issue.message);
      }
      setErrors(fieldErrors);
      return;
    }

    // 2) Server decides the truth.
    try {
      const user = await loginMutation.mutateAsync(parsed.data);
      setEmail(parsed.data.email);
      finishLogin(user);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setErrors(err.errors ?? {});
        toast.error(err.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  }

  const pending = loginMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@student.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!errors.password}
          className={errors.password ? "border-destructive" : ""}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password[0]}</p>}
      </div>

      <Button
        type="submit"
        className="w-full font-heading font-semibold glow-sm"
        disabled={pending || demoPending !== null}
      >
        {pending ? "Logging in..." : "Login →"}
      </Button>

      <Separator />

      <div className="space-y-2 rounded-lg border border-border/70 bg-muted/40 p-3">
        <p className="text-xs font-medium text-foreground">Demo login_</p>
        <p className="text-[11px] text-muted-foreground">
          One click — no typing. Uses the seeded demo accounts.
        </p>
        <div className="grid gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => quickLogin("STUDENT")}
            disabled={demoPending !== null || pending}
            className="justify-between border-success/30 bg-success/5 hover:border-success/60 hover:bg-success/10"
          >
            <span>👨‍🎓 Login as Student</span>
            <span className="text-[11px] font-normal text-muted-foreground">
              {demoPending === "STUDENT" ? "Logging in..." : "rafi@student.com →"}
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => quickLogin("MENTOR")}
            disabled={demoPending !== null || pending}
            className="justify-between border-primary/30 bg-primary/5 hover:border-primary/60 hover:bg-primary/10"
          >
            <span>🧑‍🏫 Login as Mentor</span>
            <span className="text-[11px] font-normal text-muted-foreground">
              {demoPending === "MENTOR" ? "Logging in..." : "admin@programming-hero.com →"}
            </span>
          </Button>
        </div>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Passwords — student: <span className="font-mono">Student123!</span> · mentor:{" "}
        <span className="font-mono">Mentor123!</span>
      </p>

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create a student account
        </Link>
      </p>
    </form>
  );
}
