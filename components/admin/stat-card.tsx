import type { LucideIcon } from "lucide-react";

/**
 * Tuile de statistique. `highlight` sert aux compteurs qui demandent une action
 * (devis en attente, remboursements à traiter) : bordure et halo violets.
 */
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-card p-5 ${
        highlight ? "border-brand/40 ring-4 ring-brand/10" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div
          className={`rounded-lg p-2 ${
            highlight
              ? "bg-brand/10 text-brand"
              : "bg-muted/60 text-muted-foreground"
          }`}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
