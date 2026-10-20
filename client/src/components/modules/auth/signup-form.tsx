"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signupSchema } from "@ph/shared";
import { useSignup } from "@/hooks";
import { ApiRequestError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldErrors = Record<string, string[]>;

export function SignupForm() {
  const router = useRouter();
  const signupMutation = useSignup();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    // Confirm-password is a UI-only rule; the shared schema stays the
    // single source of truth for what the server will accept.
    if (form.password !== form.confirm) {
      setErrors({ confirm: ["Passwords do not match"] });
      return;
    }

    const parsed = signupSchema.safeParse({
      name: form.name,
      email: form.email,
      password: form.password,
    });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        (fieldErrors[issue.path.join(".")] ??= []).push(issue.message);
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      await signupMutation.mutateAsync(parsed.data);
      toast.success("Account created — welcome to Programming Hero! 🚀");
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setErrors(err.errors ?? {});
        toast.error(err.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  }

  const pending = signupMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          placeholder="Rafi Hasan"
          value={form.name}
          onChange={set("name")}
          aria-invalid={!!errors.name}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@student.com"
          value={form.email}
          onChange={set("email")}
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
          placeholder="At least 8 characters"
          value={form.password}
          onChange={set("password")}
          aria-invalid={!!errors.password}
          className={errors.password ? "border-destructive" : ""}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input
          id="confirm"
          type="password"
          placeholder="Repeat your password"
          value={form.confirm}
          onChange={set("confirm")}
          aria-invalid={!!errors.confirm}
          className={errors.confirm ? "border-destructive" : ""}
        />
        {errors.confirm && <p className="text-xs text-destructive">{errors.confirm[0]}</p>}
      </div>

      <Button type="submit" className="w-full font-heading font-semibold glow-sm" disabled={pending}>
        {pending ? "Creating account..." : "Create account →"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Mentor accounts are created by the admin — students can&apos;t self-upgrade.
      </p>
    </form>
  );
}
