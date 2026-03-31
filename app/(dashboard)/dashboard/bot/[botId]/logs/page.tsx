"use client";

import { ScrollText, Save } from "lucide-react";
import {
  CyberInput,
  ModuleToggle,
  PageHeader,
  LoadingScreen,
} from "@/components/dashboard/cyber-ui";
import { Switch } from "@/components/ui/switch";
import { useBotConfig } from "@/hooks/use-bot-config";

const LOG_EVENTS = [
  ["member.join",             "📥 member.join"],
  ["member.leave",            "📤 member.leave"],
  ["moderation.ban",          "🔨 moderation.ban"],
  ["moderation.unban",        "✅ moderation.unban"],
  ["moderation.kick",         "👢 moderation.kick"],
  ["moderation.warn",         "⚠️ moderation.warn"],
  ["moderation.unwarn",       "✅ moderation.unwarn"],
  ["moderation.timeout",      "🔇 moderation.timeout"],
  ["moderation.untimeout",    "🔊 moderation.untimeout"],
  ["moderation.clear",        "🗑️ moderation.clear"],
  ["moderation.automod",      "🤖 moderation.automod"],
  ["ticket.create",           "🎫 ticket.create"],
  ["ticket.close",            "🔒 ticket.close"],
  ["levels.levelup",          "⬆️ levels.levelup"],
  ["discord.message.delete",  "🗑️ msg.delete"],
  ["discord.message.edit",    "✏️ msg.edit"],
  ["discord.message.bulk",    "🗑️ msg.bulk"],
  ["discord.voice.join",      "🔊 voice.join"],
  ["discord.voice.leave",     "🔇 voice.leave"],
  ["discord.voice.move",      "🔀 voice.move"],
  ["discord.channel.create",  "📁 channel.create"],
  ["discord.channel.delete",  "📁 channel.delete"],
  ["discord.channel.update",  "📝 channel.update"],
  ["discord.role.create",     "🎭 role.create"],
  ["discord.role.delete",     "🎭 role.delete"],
  ["discord.role.update",     "🎭 role.update"],
  ["discord.member.update",   "👤 member.update"],
  ["discord.invite.create",   "🔗 invite.create"],
  ["discord.invite.delete",   "🔗 invite.delete"],
] as const;

type LogEvent = (typeof LOG_EVENTS)[number][0];

const MENTION_EVENTS = [
  "moderation.ban",
  "moderation.kick",
  "moderation.automod",
  "moderation.warn",
  "moderation.timeout",
  "ticket.create",
] as const;

type MentionEvent = (typeof MENTION_EVENTS)[number];

const COLOR_FIELDS = [
  ["logsColorMembers",    "couleur_membres",       "22c55e"],
  ["logsColorModeration", "couleur_modération",    "ef4444"],
  ["logsColorTickets",    "couleur_tickets",       "3b82f6"],
  ["logsColorLevels",     "couleur_niveaux",       "f59e0b"],
  ["logsColorDiscord",    "couleur_discord_natif", "5865f2"],
] as const;

type ColorField = (typeof COLOR_FIELDS)[number][0];

export default function LogsPage() {
  const { config, saving, saved, update, updateModuleConfig, save } = useBotConfig();

  if (!config) return <LoadingScreen />;

  const disabledEvents: LogEvent[] = (config.config.logsDisabledEvents as LogEvent[]) ?? [];
  const mentionEvents: MentionEvent[] = (
    config.config.logsMentionOnEvents?.length
      ? config.config.logsMentionOnEvents
      : ["moderation.ban", "moderation.kick", "moderation.automod"]
  ) as MentionEvent[];

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<ScrollText className="size-4" />}
        title="Logs"
        subtitle="Journalisation des événements Discord"
        status={config.status}
      />

      <ModuleToggle
        icon={<ScrollText className="size-3.5" />}
        label="logs"
        description="Logs centralisés et configurables de tous les événements"
        enabled={config.moduleLog}
        onToggle={() => update("moduleLog", !config.moduleLog)}
      >
        {/* Salons */}
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">
          — salons —
        </p>
        <CyberInput
          label="salon_par_défaut (fallback)"
          value={config.config.logsChannelId ?? ""}
          onChange={(v) => updateModuleConfig("logsChannelId", v)}
          placeholder="ID salon utilisé si aucun salon spécifique"
        />
        <div className="grid grid-cols-2 gap-2">
          <CyberInput
            label="salon_membres"
            value={config.config.logsChannelMembers ?? ""}
            onChange={(v) => updateModuleConfig("logsChannelMembers", v)}
            placeholder="join / leave"
          />
          <CyberInput
            label="salon_modération"
            value={config.config.logsChannelModeration ?? ""}
            onChange={(v) => updateModuleConfig("logsChannelModeration", v)}
            placeholder="ban / kick / warn..."
          />
          <CyberInput
            label="salon_tickets"
            value={config.config.logsChannelTickets ?? ""}
            onChange={(v) => updateModuleConfig("logsChannelTickets", v)}
            placeholder="ouverture / fermeture"
          />
          <CyberInput
            label="salon_niveaux"
            value={config.config.logsChannelLevels ?? ""}
            onChange={(v) => updateModuleConfig("logsChannelLevels", v)}
            placeholder="level up"
          />
          <CyberInput
            label="salon_discord_natif"
            value={config.config.logsChannelDiscord ?? ""}
            onChange={(v) => updateModuleConfig("logsChannelDiscord", v)}
            placeholder="msgs, vocal, rôles, salons..."
          />
        </div>

        {/* Couleurs */}
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">
          — couleurs d&apos;embed —
        </p>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_FIELDS.map(([key, label, placeholder]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="size-6 shrink-0 rounded border border-dashed"
                style={{ backgroundColor: `#${(config.config[key as ColorField] as string) || placeholder}` }}
              />
              <CyberInput
                label={label}
                value={(config.config[key as ColorField] as string) ?? ""}
                onChange={(v) => updateModuleConfig(key as ColorField, v)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
        <p className="font-mono text-[9px] text-muted-foreground/50">
          Hex sans # — ex: ef4444
        </p>

        {/* Mentions */}
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">
          — mentions staff —
        </p>
        <CyberInput
          label="mention_role_id"
          value={config.config.logsMentionRoleId ?? ""}
          onChange={(v) => updateModuleConfig("logsMentionRoleId", v)}
          placeholder="ID du rôle à mentionner (staff, admin...)"
        />
        <p className="font-mono text-[9px] text-muted-foreground/50">
          Déclenche une mention sur les événements sélectionnés :
        </p>
        <div className="flex flex-wrap gap-1.5">
          {MENTION_EVENTS.map((evt) => {
            const active = mentionEvents.includes(evt);
            return (
              <button
                key={evt}
                type="button"
                onClick={() => {
                  const next = active
                    ? mentionEvents.filter((e) => e !== evt)
                    : [...mentionEvents, evt];
                  updateModuleConfig("logsMentionOnEvents", next);
                }}
                className={`rounded border px-2 py-0.5 font-mono text-[9px] transition ${
                  active
                    ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                    : "border-dashed text-muted-foreground/40 hover:border-blue-500/20"
                }`}
              >
                {evt}
              </button>
            );
          })}
        </div>

        {/* Événements */}
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">
          — filtrage des événements —
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {LOG_EVENTS.map(([evt, label]) => {
            const disabled = disabledEvents.includes(evt);
            return (
              <div key={evt} className="flex items-center justify-between">
                <span
                  className={`font-mono text-[9px] ${
                    disabled ? "text-muted-foreground/30 line-through" : "text-foreground"
                  }`}
                >
                  {label}
                </span>
                <Switch
                  checked={!disabled}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? disabledEvents.filter((e) => e !== evt)
                      : [...disabledEvents, evt];
                    updateModuleConfig("logsDisabledEvents", next);
                  }}
                  className="scale-75"
                />
              </div>
            );
          })}
        </div>
      </ModuleToggle>

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
