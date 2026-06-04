"use client";

import { Save, Volume2 } from "lucide-react";
import { CyberInput, PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { Switch } from "@/components/ui/switch";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useParams } from "next/navigation";
import { ChannelSelect } from "@/components/dashboard/discord-select";

export default function TempChannelsPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();

  if (!config) return <LoadingScreen />;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Volume2 className="size-4" />}
        title="Temp Channels"
        subtitle="Salons vocaux temporaires créés à la demande"
        status={config.status}
      />

      <div className="space-y-3">

        <ChannelSelect
          botId={botId}
          label="trigger_channel_id"
          value={config.config.tempChannelsTriggerChannelId ?? ""}
          onChange={(v) => updateModuleConfig("tempChannelsTriggerChannelId", v)}
          filter="voice"
        />

        <ChannelSelect
          botId={botId}
          label="category_id"
          value={config.config.tempChannelsCategoryId ?? ""}
          onChange={(v) => updateModuleConfig("tempChannelsCategoryId", v)}
          filter="all"
        />

        <CyberInput
          label="default_user_limit (0 = illimité)"
          value={String(config.config.tempChannelsDefaultUserLimit ?? 0)}
          onChange={(v) => updateModuleConfig("tempChannelsDefaultUserLimit", parseInt(v) || 0)}
          placeholder="0"
        />

        <CyberInput
          label="channel_name_template"
          value={config.config.tempChannelsChannelNameTemplate ?? ""}
          onChange={(v) => updateModuleConfig("tempChannelsChannelNameTemplate", v)}
          placeholder="{username}'s Channel"
        />

        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500">
            ▶ placeholder disponible
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-[10px] text-blue-400">{"{username}"}</span>
            <span className="font-mono text-[9px] text-muted-foreground/50">→ pseudo affiché du membre</span>
          </div>
        </div>

        <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">permissions_membres</p>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="font-mono text-[10px] text-foreground">allow_rename</p>
              <p className="font-mono text-[9px] text-muted-foreground/60">
                Le propriétaire peut renommer son salon (/salon rename)
              </p>
            </div>
            <Switch
              checked={config.config.tempChannelsAllowRename ?? true}
              onCheckedChange={(v) => updateModuleConfig("tempChannelsAllowRename", v)}
              className="scale-75"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="font-mono text-[10px] text-foreground">allow_limit</p>
              <p className="font-mono text-[9px] text-muted-foreground/60">
                Le propriétaire peut limiter le nombre de membres (/salon limit)
              </p>
            </div>
            <Switch
              checked={config.config.tempChannelsAllowLimit ?? true}
              onCheckedChange={(v) => updateModuleConfig("tempChannelsAllowLimit", v)}
              className="scale-75"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="font-mono text-[10px] text-foreground">allow_private</p>
              <p className="font-mono text-[9px] text-muted-foreground/60">
                Le propriétaire peut verrouiller son salon (/salon lock)
              </p>
            </div>
            <Switch
              checked={config.config.tempChannelsAllowPrivate ?? true}
              onCheckedChange={(v) => updateModuleConfig("tempChannelsAllowPrivate", v)}
              className="scale-75"
            />
          </div>
        </div>

        <div className="rounded-xl border border-dashed bg-card p-4 space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">commandes_disponibles</p>
          {[
            ["/salon rename [nom]", "Renommer le salon"],
            ["/salon limit [0-99]", "Limiter le nombre de membres (0 = illimité)"],
            ["/salon lock", "Rendre le salon privé"],
            ["/salon unlock", "Rendre le salon public"],
            ["/salon kick [@user]", "Expulser un membre"],
          ].map(([cmd, desc]) => (
            <div key={cmd} className="flex items-start gap-3">
              <span className="font-mono text-[10px] text-blue-400 shrink-0">{cmd}</span>
              <span className="font-mono text-[9px] text-muted-foreground/50">{desc}</span>
            </div>
          ))}
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
