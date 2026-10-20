import type { Stats } from "@ph/shared";

const cards = [
  {
    key: "total" as const,
    label: "Total_ Submissions",
    icon: "📁",
    from: "from-primary/20",
    to: "to-[#7b2ff7]/20",
    text: "text-primary",
    ring: "border-primary/30",
  },
  {
    key: "pending" as const,
    label: "Total_ Pending",
    icon: "⏳",
    from: "from-warning/20",
    to: "to-warning/5",
    text: "text-warning",
    ring: "border-warning/30",
  },
  {
    key: "approved" as const,
    label: "Total_ Approved",
    icon: "✅",
    from: "from-success/20",
    to: "to-success/5",
    text: "text-success",
    ring: "border-success/30",
  },
  {
    key: "rejected" as const,
    label: "Total_ Rejected",
    icon: "❌",
    from: "from-danger/20",
    to: "to-danger/5",
    text: "text-danger",
    ring: "border-danger/30",
  },
];

export function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.key}
          className={`relative overflow-hidden rounded-2xl border ${c.ring} bg-card p-4 transition-shadow hover:glow-sm`}
        >
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${c.from} ${c.to} opacity-60`}
          />
          <div className="relative flex items-center justify-between">
            <div>
              <p className={`font-heading text-3xl font-bold ${c.text}`}>{stats[c.key]}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{c.label}</p>
            </div>
            <span className="text-2xl">{c.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
