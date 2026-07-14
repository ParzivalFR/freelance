"use client";

import { Save, Users2 } from "lucide-react";
import { CyberInput, PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useParams } from "next/navigation";
import { ChannelSelect, RoleSelect } from "@/components/dashboard/discord-select";

export default function TeamsPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();

  if (!config) return <LoadingScreen />;

  const c = config.config;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Users2 className="size-4" />}
        title="Projets"
        subtitle="Recherche de coéquipiers pour un projet — nom de commande personnalisable"
        status={config.status}
      />

      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          personnalisation
        </p>

        <CyberInput
          label="nom_de_la_commande"
          value={c.teamsCommandName ?? ""}
          onChange={(v) => updateModuleConfig("teamsCommandName", v)}
          placeholder="projet"
        />
        <p className="font-mono text-[9px] text-muted-foreground/50 -mt-2">
          Ex: &quot;guilde&quot; → /guilde poster, /guilde clore. Pas d&apos;espaces ni de majuscules.
        </p>
      </div>

      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          salon & staff
        </p>

        <ChannelSelect
          botId={botId}
          label="salon_des_projets"
          value={c.teamsChannelId ?? ""}
          onChange={(v) => updateModuleConfig("teamsChannelId", v)}
          filter="text"
        />

        <RoleSelect
          botId={botId}
          label="rôle_staff (peut clore les projets des autres)"
          value={c.teamsGardeRoleId ?? ""}
          onChange={(v) => updateModuleConfig("teamsGardeRoleId", v)}
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg border border-dashed px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Save className="size-3.5" />
          {saved ? "✓ saved" : saving ? "saving..." : "save_config"}
        </button>
      </div>
    </div>
  );
}
