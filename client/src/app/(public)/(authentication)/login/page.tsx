import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/layout/auth-shell";
import { LoginForm } from "@/components/modules/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Log in to submit your project or review students' work — or use one-click demo login.",
};

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
      <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
