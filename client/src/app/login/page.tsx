"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import { loginSchema } from "@ph/shared";
import { useAuth, ApiRequestError } from "@/components/auth-provider";
import { AuthShell } from "@/components/auth-shell";
import { homeFor } from "@/app/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type FieldErrors = Record<string, string[]>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [demoPending, setDemoPending] = useState<"STUDENT" | "MENTOR" | null>(null);

  /** Shared post-login step: safe redirect + fresh server data. */
  function finishLogin(user: { name: string; role: "STUDENT" | "MENTOR" }) {
    toast.success(`Welcome back, ${user.name.split(" ")[0]}! 🚀`);
    const from = searchParams.get("from");
    // Only allow same-site redirects (never an absolute URL from the query).
    const target =
      from && from.startsWith("/") && !from.startsWith("//") ? from : homeFor(user.role);
    router.push(target);
    router.refresh();
  }

  /** One-click login for the seeded demo accounts (handy for reviewers). */
  async function quickLogin(role: "STUDENT" | "MENTOR") {
    const creds =
      role === "STUDENT"
        ? { email: "rafi@student.com", password: "Student123!" }
        : { email: "admin@programming-hero.com", password: "Mentor123!" };

    setEmail(creds.email);
    setPassword(creds.password);
    setErrors({});
    setDemoPending(role);

    try {
      finishLogin(await login(creds));
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Something went wrong.");
      setDemoPending(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setPending(true);

    // 1) Client-side check with the SAME schema the server uses.
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        (fieldErrors[issue.path.join(".")] ??= []).push(issue.message);
      }
      setErrors(fieldErrors);
      setPending(false);
      return;
    }

    // 2) Server decides the truth.
    try {
      finishLogin(await login(parsed.data));
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setErrors(err.errors ?? {});
        toast.error(err.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      setPending(false);
    }
  }

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

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back, Hero_"
      subtitle="Login to submit your project or review your students' work."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
