"use client";

import { Save, Gem } from "lucide-react";
import { CyberTextarea, PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useParams } from "next/navigation";
import { ChannelSelect, RoleSelect } from "@/components/dashboard/discord-select";

export default function BoosterPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();

  if (!config) return <LoadingScreen />;

  const c = config.config;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Gem className="size-4" />}
        title="Booster"
        subtitle="Attribue un rôle automatiquement aux membres qui boostent le serveur"
        status={config.status}
      />

      <div className="space-y-3">
        <RoleSelect
          botId={botId}
          label="rôle_booster"
          value={c.boosterRoleId ?? ""}
          onChange={(v) => updateModuleConfig("boosterRoleId", v)}
        />
        <p className="font-mono text-[9px] text-muted-foreground/50 -mt-2">
          Attribué dès qu&apos;un membre commence à booster, retiré s&apos;il arrête.
        </p>
      </div>

      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          annonce (optionnel)
        </p>

        <ChannelSelect
          botId={botId}
          label="salon_annonce"
          value={c.boosterAnnounceChannelId ?? ""}
          onChange={(v) => updateModuleConfig("boosterAnnounceChannelId", v)}
          filter="text"
        />

        <CyberTextarea
          label="message"
          value={c.boosterAnnounceMessage ?? ""}
          onChange={(v) => updateModuleConfig("boosterAnnounceMessage", v)}
          placeholder="🚀 {user} vient de booster le serveur, merci !"
          botId={botId}
        />
        <p className="font-mono text-[9px] text-muted-foreground/50 -mt-2">
          Placeholders : {"{user}"} {"{server}"}
        </p>
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
