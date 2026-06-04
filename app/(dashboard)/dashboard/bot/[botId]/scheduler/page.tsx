"use client";

import { Clock } from "lucide-react";
import { PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";

export default function SchedulerPage() {
  const { config } = useBotConfig();

  if (!config) return <LoadingScreen />;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Clock className="size-4" />}
        title="Messages programmés"
        subtitle="Programme l'envoi automatique de messages"
        status={config.status}
      />

      <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
        <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
          Active le module et utilise les commandes Discord pour gérer les messages programmés.
        </p>
        <div className="space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">commandes</p>
          <div className="space-y-1 font-mono text-[10px] text-foreground">
            <p>/schedule add [salon] [contenu] [quand]</p>
            <p className="text-muted-foreground/70 pl-4">→ quand : <code>daily</code>, <code>weekly</code>, <code>monthly</code> ou <code>2024-12-25 20:00</code></p>
            <p>/schedule list</p>
            <p>/schedule delete [id]</p>
          </div>
        </div>
      </div>
    </div>
  );
}
