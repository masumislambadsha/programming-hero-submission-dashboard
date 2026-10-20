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
      const user = await login(parsed.data);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}! 🚀`);

      const from = searchParams.get("from");
      // Only allow same-site redirects (never an absolute URL from the query).
      const target = from && from.startsWith("/") && !from.startsWith("//") ? from : homeFor(user.role);
      router.push(target);
      router.refresh();
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

      <Button type="submit" className="w-full font-heading font-semibold glow-sm" disabled={pending}>
        {pending ? "Logging in..." : "Login →"}
      </Button>

      <Separator />

      <div className="rounded-lg border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
        <p className="mb-1.5 font-medium text-foreground">Demo accounts_</p>
        <p>👨‍🎓 Student — rafi@student.com / Student123!</p>
        <p>🧑‍🏫 Mentor — admin@programming-hero.com / Mentor123!</p>
      </div>

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
