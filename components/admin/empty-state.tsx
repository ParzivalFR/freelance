import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** État vide partagé : cadre pointillé, icône estompée, titre + explication. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
      <Icon className="mx-auto mb-4 size-10 text-muted-foreground/50" />
      <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
