"use client";

import { useState } from "react";
import { toast } from "sonner";
import { reviewSchema } from "@ph/shared";
import { useReviewSubmission } from "@/hooks";
import { ApiRequestError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Action = "APPROVED" | "REJECTED";

export function ReviewActions({
  submissionId,
  projectName,
  action,
}: {
  submissionId: string;
  projectName: string;
  action: Action;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const reviewMutation = useReviewSubmission();

  const isApprove = action === "APPROVED";

  async function handleSubmit() {
    setError("");

    // Same shared schema the server re-runs — client checks length, server
    // checks everything again plus role and existence.
    const parsed = reviewSchema.safeParse({ status: action, note: note || undefined });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid note.");
      return;
    }

    try {
      await reviewMutation.mutateAsync({ id: submissionId, ...parsed.data });
      toast.success(
        isApprove
          ? `"${projectName}" approved! 🎉`
          : `"${projectName}" rejected — the student will see your note.`,
      );
      setOpen(false);
      setNote("");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
        toast.error(err.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setError("");
      }}
    >
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant={isApprove ? "default" : "outline"}
            className={
              isApprove
                ? "bg-gradient-to-r from-primary to-[#7b2ff7] font-medium hover:opacity-90 glow-sm"
                : "border-danger/40 text-danger hover:border-danger hover:bg-danger/10"
            }
          />
        }
      >
        {isApprove ? "Approve" : "Reject"}
      </DialogTrigger>

      <DialogContent className="border-border/70 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isApprove ? "✅ Approve" : "❌ Reject"} “{projectName}”?
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? "The student will see this project marked as approved."
              : "The student will see the rejection and your feedback note."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="note">
            Feedback note{" "}
            <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="note"
            rows={3}
            maxLength={500}
            placeholder={
              isApprove
                ? "Great job! Nice use of CSS animations."
                : "Explain what needs to be improved before resubmission."
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={error ? "border-destructive" : ""}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-border hover:border-primary/40"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={reviewMutation.isPending}
            className={
              isApprove
                ? "bg-gradient-to-r from-primary to-[#7b2ff7] hover:opacity-90"
                : "bg-destructive hover:bg-destructive/90"
            }
          >
            {reviewMutation.isPending ? "Saving..." : isApprove ? "Confirm approve" : "Confirm reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
