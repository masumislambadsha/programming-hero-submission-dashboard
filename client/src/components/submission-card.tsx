import type { Submission } from "@ph/shared";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SubmissionCard({ submission: s }: { submission: Submission }) {
  return (
    <Card className="border-border/70 bg-card/70 transition-colors hover:border-primary/40">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="font-heading text-base font-semibold leading-snug">
            {s.projectName}
          </CardTitle>
          <StatusBadge status={s.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">{s.description}</p>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <a
            href={s.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border bg-muted/50 px-2.5 py-1 font-mono transition-colors hover:border-primary/50 hover:text-primary"
          >
            ⌨ repo ↗
          </a>
          {s.liveUrl && (
            <a
              href={s.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border bg-muted/50 px-2.5 py-1 font-mono transition-colors hover:border-primary/50 hover:text-primary"
            >
              🌐 live ↗
            </a>
          )}
          <span className="text-muted-foreground">submitted {formatDate(s.createdAt)}</span>
        </div>

        {s.feedback.length > 0 && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
              Mentor feedback
            </p>
            {s.feedback.map((f) => (
              <div key={f.id} className="mb-1.5 last:mb-0">
                <p className="text-sm text-foreground/90">{f.comment}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  — {f.reviewer.name}, {formatDate(f.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}

        {s.status === "REJECTED" && s.feedback.length === 0 && (
          <Badge variant="outline" className="border-danger/40 bg-danger/10 text-danger">
            Needs work — fix and talk to your mentor
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
