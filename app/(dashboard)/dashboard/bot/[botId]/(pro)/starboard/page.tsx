"use client";

import { Save, Star } from "lucide-react";
import { CyberInput, LoadingScreen, PageHeader } from "@/components/dashboard/cyber-ui";
import { Switch } from "@/components/ui/switch";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useParams } from "next/navigation";
import { ChannelSelect } from "@/components/dashboard/discord-select";

export default function StarboardPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();

  if (!config) return <LoadingScreen />;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Star className="size-4" />}
        title="Starboard"
        subtitle="Reposte automatiquement les messages les plus réactés"
        status={config.status}
      />

      <div className="space-y-4 rounded-xl border border-dashed bg-card p-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— configuration —</p>

        <ChannelSelect
          botId={botId}
          label="salon_starboard"
          value={config.config.starboardChannelId ?? ""}
          onChange={(v) => updateModuleConfig("starboardChannelId", v)}
          filter="text"
        />

        <div className="grid grid-cols-2 gap-3">
          <CyberInput
            label="emoji"
            value={config.config.starboardEmoji ?? ""}
            onChange={(v) => updateModuleConfig("starboardEmoji", v)}
            placeholder="⭐"
          />
          <CyberInput
            label="seuil_reactions"
            value={String(config.config.starboardThreshold ?? "")}
            onChange={(v) => updateModuleConfig("starboardThreshold", v === "" ? undefined : Number(v))}
            placeholder="3"
          />
        </div>

        <CyberInput
          label="couleur_embed (hex, sans #)"
          value={config.config.starboardEmbedColor ?? ""}
          onChange={(v) => updateModuleConfig("starboardEmbedColor", v)}
          placeholder="F1C40F"
        />
      </div>

      <div className="space-y-3 rounded-xl border border-dashed bg-card p-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— options —</p>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="font-mono text-[10px] text-foreground">self_star</p>
            <p className="font-mono text-[9px] text-muted-foreground/60">
              Autoriser l&apos;auteur à star son propre message
            </p>
          </div>
          <Switch
            checked={config.config.starboardSelfStar ?? false}
            onCheckedChange={(v) => updateModuleConfig("starboardSelfStar", v)}
          />
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="font-mono text-[10px] text-foreground">ignore_bots</p>
            <p className="font-mono text-[9px] text-muted-foreground/60">
              Ignorer les messages envoyés par des bots
            </p>
          </div>
          <Switch
            checked={config.config.starboardIgnoreBots ?? true}
            onCheckedChange={(v) => updateModuleConfig("starboardIgnoreBots", v)}
          />
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="font-mono text-[10px] text-foreground">remove_on_unstar</p>
            <p className="font-mono text-[9px] text-muted-foreground/60">
              Supprimer l&apos;entrée starboard si les réactions tombent sous le seuil
            </p>
          </div>
          <Switch
            checked={config.config.starboardRemoveOnUnstar ?? false}
            onCheckedChange={(v) => updateModuleConfig("starboardRemoveOnUnstar", v)}
          />
        </div>
      </div>

      <div className="flex justify-end">
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
