"use client";

import { ClipboardList } from "lucide-react";
import { PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";

export default function ApplicationsPage() {
  const { config } = useBotConfig();

  if (!config) return <LoadingScreen />;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<ClipboardList className="size-4" />}
        title="Candidatures"
        subtitle="Formulaires de candidature avec questions personnalisées"
        status={config.status}
      />

      <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
        <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
          Crée des formulaires de candidature via l'API et utilise <code className="text-foreground">/apply post [form_id]</code>
          pour les poster. Les membres remplissent un modal Discord, et tu reviews dans un salon dédié avec boutons Accepter/Refuser.
        </p>
        <p className="font-mono text-[10px] text-muted-foreground/60 pt-2">
          ⚠️ Interface de création de formulaires à venir — utilise l'API pour le moment.
        </p>
      </div>
    </div>
  );
}
