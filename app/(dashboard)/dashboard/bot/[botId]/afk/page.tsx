"use client";

import { Moon } from "lucide-react";
import { PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";

export default function AfkPage() {
  const { config } = useBotConfig();

  if (!config) return <LoadingScreen />;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Moon className="size-4" />}
        title="AFK"
        subtitle="Système de statut AFK automatique"
        status={config.status}
      />

      <div className="rounded-xl border border-dashed bg-card p-4">
        <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
          Active le module AFK pour que tes membres puissent utiliser <code className="text-foreground">/afk [raison]</code>.
          Quand ils sont mentionnés, le bot répondra automatiquement avec leur raison et le temps écoulé.
          Le statut est retiré dès qu'ils envoient un message.
        </p>
        <div className="mt-3 grid gap-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">commandes</p>
          <p className="font-mono text-[10px] text-foreground">/afk [raison] — marquer comme absent</p>
        </div>
      </div>
    </div>
  );
}
