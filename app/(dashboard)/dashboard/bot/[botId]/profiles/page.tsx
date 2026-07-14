"use client";

import { Save, ClipboardList } from "lucide-react";
import { CyberInput, PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useParams } from "next/navigation";
import { ChannelSelect, RoleSelect } from "@/components/dashboard/discord-select";

export default function ProfilesPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();

  if (!config) return <LoadingScreen />;

  const c = config.config;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<ClipboardList className="size-4" />}
        title="Profils"
        subtitle="Registre de profils membres — nom de commande et vocabulaire personnalisables"
        status={config.status}
      />

      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          personnalisation
        </p>

        <CyberInput
          label="nom_de_la_commande"
          value={c.profilesCommandName ?? ""}
          onChange={(v) => updateModuleConfig("profilesCommandName", v)}
          placeholder="profil"
        />
        <p className="font-mono text-[9px] text-muted-foreground/50 -mt-2">
          Ex: &quot;artisan&quot; → /artisan creer, /artisan voir. Pas d&apos;espaces ni de majuscules.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <CyberInput
            label="terme (singulier)"
            value={c.profilesTermSingular ?? ""}
            onChange={(v) => updateModuleConfig("profilesTermSingular", v)}
            placeholder="profil"
          />
          <CyberInput
            label="terme avis"
            value={c.profilesTermReview ?? ""}
            onChange={(v) => updateModuleConfig("profilesTermReview", v)}
            placeholder="avis"
          />
        </div>

        <CyberInput
          label="emoji_score"
          value={c.profilesScoreEmoji ?? ""}
          onChange={(v) => updateModuleConfig("profilesScoreEmoji", v)}
          placeholder="⭐"
        />
      </div>

      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          salon & rôle
        </p>

        <ChannelSelect
          botId={botId}
          label="salon_registre"
          value={c.profilesChannelId ?? ""}
          onChange={(v) => updateModuleConfig("profilesChannelId", v)}
          filter="text"
        />

        <RoleSelect
          botId={botId}
          label="rôle_attribué_à_la_création"
          value={c.profilesRoleId ?? ""}
          onChange={(v) => updateModuleConfig("profilesRoleId", v)}
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
