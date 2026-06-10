"use client";

import { Save, Radio, Plus, Trash2 } from "lucide-react";
import { CyberInput, PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import type { StatusEntry } from "@/components/dashboard/bot-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACTIVITY_TYPES: { value: StatusEntry["type"]; label: string; emoji: string }[] = [
  { value: "PLAYING",   label: "Joue à",    emoji: "🎮" },
  { value: "WATCHING",  label: "Regarde",   emoji: "👀" },
  { value: "LISTENING", label: "Écoute",    emoji: "🎵" },
  { value: "COMPETING", label: "Participe", emoji: "🏆" },
  { value: "STREAMING", label: "Stream",    emoji: "📺" },
  { value: "CUSTOM",    label: "Statut",    emoji: "💬" },
];

const ONLINE_STATUSES = [
  { value: "online",    label: "En ligne",          color: "bg-green-500" },
  { value: "idle",      label: "Absent (lune)",     color: "bg-yellow-500" },
  { value: "dnd",       label: "Ne pas déranger",   color: "bg-red-500" },
  { value: "invisible", label: "Invisible",         color: "bg-gray-500" },
] as const;

function emptyEntry(): StatusEntry {
  return { type: "PLAYING", text: "" };
}

export default function BotStatusPage() {
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();

  if (!config) return <LoadingScreen />;

  const entries: StatusEntry[] = (config.config.statusEntries as StatusEntry[]) ?? [emptyEntry()];
  const rotationInterval: number = (config.config.statusRotationInterval as number) ?? 30;
  const onlineStatus = (config.config.botOnlineStatus as string) ?? "online";

  const updateEntry = (index: number, patch: Partial<StatusEntry>) => {
    const next = entries.map((e, i) => (i === index ? { ...e, ...patch } : e));
    updateModuleConfig("statusEntries", next);
  };

  const removeEntry = (index: number) => {
    const next = entries.filter((_, i) => i !== index);
    updateModuleConfig("statusEntries", next.length > 0 ? next : [emptyEntry()]);
  };

  const addEntry = () => {
    updateModuleConfig("statusEntries", [...entries, emptyEntry()]);
  };

  const currentOnline = ONLINE_STATUSES.find((s) => s.value === onlineStatus) ?? ONLINE_STATUSES[0];

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Radio className="size-4" />}
        title="Statut du bot"
        subtitle="Présence et activité affichées sur le profil Discord de ton bot"
        status={config.status}
      />

      {/* Statut en ligne */}
      <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— statut en ligne —</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ONLINE_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => updateModuleConfig("botOnlineStatus", s.value)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-[10px] transition ${
                onlineStatus === s.value
                  ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                  : "border-dashed text-muted-foreground/50 hover:border-blue-500/20 hover:text-muted-foreground"
              }`}
            >
              <span className={`size-2 shrink-0 rounded-full ${s.color}`} />
              {s.label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[9px] text-muted-foreground/40">
          Statut actuel sélectionné :{" "}
          <span className="text-foreground">{currentOnline.label}</span>
        </p>
      </div>

      {/* Liste des activités */}
      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— activités —</p>
        <p className="font-mono text-[9px] text-muted-foreground/50">
          Si tu ajoutes plusieurs activités, le bot les fait tourner automatiquement selon l&apos;intervalle défini.
        </p>

        {entries.map((entry, i) => (
          <div key={i} className="rounded-xl border border-dashed bg-card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-muted-foreground/40">activité_{i + 1}</span>
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(i)}
                  className="text-muted-foreground/30 transition hover:text-red-400"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-2">
              <div className="space-y-1">
                <label className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">
                  type
                </label>
                <Select
                  value={entry.type}
                  onValueChange={(v) => updateEntry(i, { type: v as StatusEntry["type"] })}
                >
                  <SelectTrigger className="font-mono text-[10px] h-9 border-dashed bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="font-mono text-[10px]">
                        {t.emoji} {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <CyberInput
                label="texte"
                value={entry.text}
                onChange={(v) => updateEntry(i, { text: v })}
                placeholder={
                  entry.type === "PLAYING"   ? "Visual Studio Code" :
                  entry.type === "WATCHING"  ? "le match de basket" :
                  entry.type === "LISTENING" ? "Lofi Hip Hop Radio" :
                  entry.type === "COMPETING" ? "un tournoi Minecraft" :
                  entry.type === "STREAMING" ? "mon stream Twitch" :
                  "Mon statut personnalisé"
                }
              />
            </div>

            {entry.type === "STREAMING" && (
              <CyberInput
                label="stream_url (twitch ou youtube)"
                value={entry.streamUrl ?? ""}
                onChange={(v) => updateEntry(i, { streamUrl: v })}
                placeholder="https://twitch.tv/tonpseudo"
              />
            )}

            <div className="mt-1 rounded border border-dashed bg-background px-2 py-1.5">
              <p className="font-mono text-[9px] text-muted-foreground/50">
                aperçu →{" "}
                <span className="text-foreground">
                  {ACTIVITY_TYPES.find((t) => t.value === entry.type)?.label ?? ""}{" "}
                  <span className="text-blue-400">{entry.text || "…"}</span>
                </span>
              </p>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addEntry}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 transition hover:border-blue-500/30 hover:text-blue-400"
        >
          <Plus className="size-3.5" />
          ajouter une activité
        </button>
      </div>

      {/* Rotation */}
      {entries.length > 1 && (
        <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— rotation —</p>
          <CyberInput
            label="intervalle_rotation (secondes)"
            value={String(rotationInterval)}
            onChange={(v) => updateModuleConfig("statusRotationInterval", Math.max(10, parseInt(v) || 30))}
            placeholder="30"
          />
          <p className="font-mono text-[9px] text-muted-foreground/40">
            Le bot change d&apos;activité toutes les {rotationInterval}s. Minimum 10 secondes.
          </p>
        </div>
      )}

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
