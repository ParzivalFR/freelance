"use client";

import { AlarmClock } from "lucide-react";
import { PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";

export default function RemindersPage() {
  const { config } = useBotConfig();

  if (!config) return <LoadingScreen />;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<AlarmClock className="size-4" />}
        title="Rappels"
        subtitle="Chaque membre peut se créer des rappels personnels"
        status={config.status}
      />

      <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
        <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
          Les rappels sont personnels à chaque membre — rien à configurer ici, active simplement le module.
        </p>
        <div className="space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">commandes</p>
          <div className="space-y-1 font-mono text-[10px] text-foreground">
            <p>/remind add [dans] [message]</p>
            <p className="text-muted-foreground/70 pl-4">→ dans : <code>10m</code>, <code>2h</code>, <code>1d</code>, <code>1w</code></p>
            <p>/remind list</p>
            <p>/remind delete [id]</p>
          </div>
        </div>
      </div>
    </div>
  );
}
