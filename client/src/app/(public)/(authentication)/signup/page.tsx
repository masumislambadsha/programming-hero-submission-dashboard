import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { SignupForm } from "@/components/modules/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a student account to submit your first project.",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Start your journey, Hero_"
      subtitle="Create a student account to submit your first project."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
