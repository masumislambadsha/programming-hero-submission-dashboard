"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSubmissionSchema } from "@ph/shared";
import { http, ApiRequestError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FieldErrors = Record<string, string[]>;

const EMPTY = { projectName: "", repoUrl: "", liveUrl: "", description: "" };

const fieldClass = (errors: FieldErrors, field: string) =>
  errors[field]?.length ? "border-destructive" : "";

export function SubmissionForm() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  const set =
    (key: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // Clear a field's error as soon as the user starts fixing it.
      setErrors((prev) => ({ ...prev, [key]: [] }));
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});

    // 1) Client-side validation — instant feedback, zero network cost.
    //    Uses the exact same Zod schema the server will run again.
    const parsed = createSubmissionSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        (fieldErrors[issue.path.join(".")] ??= []).push(issue.message);
      }
      setErrors(fieldErrors);
      setPending(false);
      return;
    }

    // 2) Server is the source of truth: it re-validates, rate-limits and
    //    checks for duplicates (including the DB unique constraint).
    try {
      await http.post("/api/submissions", parsed.data);
      toast.success("Project submitted! Your mentor will review it soon. 🚀");
      setForm(EMPTY);
      router.refresh(); // re-render the server-fetched list with fresh data
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setErrors(err.errors ?? {});
        toast.error(err.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="border-border/70 bg-card glow-sm">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Submit your project_</CardTitle>
        <CardDescription>
          One repository, one submission. Duplicates are rejected automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="projectName">Project name</Label>
            <Input
              id="projectName"
              placeholder="Monster House"
              value={form.projectName}
              onChange={set("projectName")}
              className={fieldClass(errors, "projectName")}
              aria-invalid={!!errors.projectName?.length}
            />
            {errors.projectName?.[0] && (
              <p className="text-xs text-destructive">{errors.projectName[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="repoUrl">Repository URL</Label>
            <Input
              id="repoUrl"
              placeholder="https://github.com/you/monster-house"
              value={form.repoUrl}
              onChange={set("repoUrl")}
              className={fieldClass(errors, "repoUrl")}
              aria-invalid={!!errors.repoUrl?.length}
            />
            {errors.repoUrl?.[0] && (
              <p className="text-xs text-destructive">{errors.repoUrl[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="liveUrl">
              Live link{" "}
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="liveUrl"
              placeholder="https://monster-house.vercel.app"
              value={form.liveUrl}
              onChange={set("liveUrl")}
              className={fieldClass(errors, "liveUrl")}
              aria-invalid={!!errors.liveUrl?.length}
            />
            {errors.liveUrl?.[0] && (
              <p className="text-xs text-destructive">{errors.liveUrl[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <span className="text-xs text-muted-foreground">{form.description.length}/1000</span>
            </div>
            <Textarea
              id="description"
              rows={5}
              placeholder="What did you build? Which concepts did you practice? What was the hardest part?"
              value={form.description}
              onChange={set("description")}
              className={fieldClass(errors, "description")}
              aria-invalid={!!errors.description?.length}
            />
            {errors.description?.[0] && (
              <p className="text-xs text-destructive">{errors.description[0]}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="w-full bg-gradient-to-r from-primary to-[#7b2ff7] font-heading font-semibold glow-sm hover:opacity-90"
          >
            {pending ? "Submitting..." : "Submit project 🚀"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
