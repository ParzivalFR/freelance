"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Shield, Trash2, ChevronLeft, ChevronRight, Save, ChevronDown, ChevronUp as ChevronUpIcon, Plus, X } from "lucide-react";
import { PageHeader, LoadingScreen, CyberInput, CyberLabel } from "@/components/dashboard/cyber-ui";
import { ChannelSelect } from "@/components/dashboard/discord-select";
import { Switch } from "@/components/ui/switch";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useDiscordUsers } from "@/hooks/use-discord-users";
import type { WarnThresholdEntry } from "@/components/dashboard/bot-types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Infraction {
  id: string;
  userId: string;
  moderatorId: string;
  type: string;
  reason: string;
  duration?: number | null;
  active: boolean;
  createdAt: string;
}

interface StatEntry {
  type: string;
  _count: { type: number };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTOMOD_ACTIONS = ["warn", "timeout", "kick", "ban"] as const;

const TYPE_STYLES: Record<string, string> = {
  BAN:     "border-red-500/30 bg-red-500/10 text-red-400",
  KICK:    "border-orange-500/30 bg-orange-500/10 text-orange-400",
  WARN:    "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  TIMEOUT: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  MUTE:    "border-purple-500/30 bg-purple-500/10 text-purple-400",
};

const TYPE_ICONS: Record<string, string> = {
  BAN:     "🔨",
  KICK:    "👢",
  WARN:    "⚠️",
  TIMEOUT: "🔇",
  MUTE:    "🔇",
};

const FILTERS = ["ALL", "BAN", "KICK", "WARN", "TIMEOUT"] as const;
type Filter = (typeof FILTERS)[number];

const PAGE_SIZE = 15;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ModerationPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();
  const [configOpen, setConfigOpen] = useState(false);

  const [infractions, setInfractions] = useState<Infraction[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<StatEntry[]>([]);
  const [last7daysRaw, setLast7daysRaw] = useState<{ createdAt: string }[]>([]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const allUserIds = infractions.flatMap((inf) => [inf.userId, inf.moderatorId]);
  const { users: discordUsers } = useDiscordUsers(botId, allUserIds);

  const fetchInfractions = useCallback(async () => {
    if (!botId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/bot/infractions?botId=${botId}&page=${page}&limit=${PAGE_SIZE}`
      );
      const data = await res.json();
      setInfractions(data.infractions ?? []);
      setTotal(data.total ?? 0);
      setStats(data.stats ?? []);
      setLast7daysRaw(data.last7daysRaw ?? []);
    } finally {
      setLoading(false);
    }
  }, [botId, page]);

  useEffect(() => {
    fetchInfractions();
  }, [fetchInfractions]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/bot/infractions/${id}`, { method: "DELETE" });
      setInfractions((prev) => prev.filter((inf) => inf.id !== id));
      setTotal((prev) => prev - 1);
    } finally {
      setDeleting(null);
    }
  };

  const last7days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const volumeByDay = last7days.map((day) => ({
    day,
    label: new Date(day + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short" }),
    count: last7daysRaw.filter((r) => r.createdAt.slice(0, 10) === day).length,
  }));

  const maxVolume = Math.max(1, ...volumeByDay.map((d) => d.count));

  const getStatCount = (type: string) =>
    stats.find((s) => s.type === type)?._count.type ?? 0;

  const filtered = infractions
    .filter((inf) => filter === "ALL" || inf.type === filter)
    .filter((inf) => !search || inf.userId.includes(search) || (discordUsers[inf.userId]?.displayName ?? "").toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (!config || (loading && infractions.length === 0)) return <LoadingScreen />;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Shield className="size-4" />}
        title="Modération"
        subtitle="/ban /kick /warn /timeout + AutoMod"
        status={config.status}
      />

      {/* ── Config section ── */}
      <div className="rounded-xl border border-dashed bg-card">
        <button
          onClick={() => setConfigOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            ⚙ configuration
          </span>
          {configOpen ? <ChevronUpIcon className="size-3.5 text-muted-foreground/50" /> : <ChevronDown className="size-3.5 text-muted-foreground/50" />}
        </button>
        {configOpen && (
          <div className="space-y-3 border-t border-dashed px-4 pb-4 pt-3">
            <ChannelSelect
              botId={botId}
              label="log_channel_id"
              value={config.config.logChannelId ?? ""}
              onChange={(v) => updateModuleConfig("logChannelId", v)}
              placeholder="Salon de logs des sanctions"
              filter="text"
            />
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">
              — seuils automatiques (warns) —
            </p>
            <div className="grid grid-cols-2 gap-2">
              <CyberInput
                label="timeout à N warns"
                value={String(config.config.warnThresholdTimeout ?? "")}
                onChange={(v) => updateModuleConfig("warnThresholdTimeout", v ? Number(v) : undefined)}
                placeholder="3"
              />
              <CyberInput
                label="durée timeout (min)"
                value={String(config.config.warnThresholdTimeoutDuration ?? "")}
                onChange={(v) => updateModuleConfig("warnThresholdTimeoutDuration", v ? Number(v) : undefined)}
                placeholder="60"
              />
              <CyberInput
                label="kick à N warns"
                value={String(config.config.warnThresholdKick ?? "")}
                onChange={(v) => updateModuleConfig("warnThresholdKick", v ? Number(v) : undefined)}
                placeholder="5"
              />
              <CyberInput
                label="ban à N warns"
                value={String(config.config.warnThresholdBan ?? "")}
                onChange={(v) => updateModuleConfig("warnThresholdBan", v ? Number(v) : undefined)}
                placeholder="7"
              />
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">
              — automod —
            </p>
            <div className="rounded-lg border border-dashed p-3 space-y-3">
              {[
                { key: "automodAntiSpam",       label: "anti-spam",         desc: "Messages répétés rapidement" },
                { key: "automodAntiDuplicate",   label: "anti-duplicate",    desc: "Messages identiques consécutifs" },
                { key: "automodAntiLinks",       label: "anti-liens",        desc: "Bloque les URLs non autorisées" },
                { key: "automodAntiMentionSpam", label: "anti-mention spam", desc: "Trop de mentions dans un message" },
                { key: "automodAntiCaps",        label: "anti-caps",         desc: "Messages en majuscules excessives" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] text-foreground">{label}</p>
                    <p className="font-mono text-[9px] text-muted-foreground/60">{desc}</p>
                  </div>
                  <Switch
                    checked={(config.config[key as keyof typeof config.config] as boolean) ?? false}
                    onCheckedChange={(v) => updateModuleConfig(key as never, v)}
                    className="scale-75"
                  />
                </div>
              ))}
              <CyberInput
                label="mots_interdits (virgule-séparés)"
                value={config.config.automodBadWords ?? ""}
                onChange={(v) => updateModuleConfig("automodBadWords", v)}
                placeholder="mot1, mot2, mot3"
              />
              <CyberInput
                label="domaines_autorisés (virgule-séparés)"
                value={config.config.automodAllowedDomains ?? ""}
                onChange={(v) => updateModuleConfig("automodAllowedDomains", v)}
                placeholder="discord.com, youtube.com"
              />
              <div className="space-y-1.5">
                <CyberLabel>action_automod</CyberLabel>
                <div className="flex gap-1.5">
                  {AUTOMOD_ACTIONS.map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => updateModuleConfig("automodAction", action)}
                      className={`rounded border px-2.5 py-1 font-mono text-[9px] transition ${
                        (config.config.automodAction ?? "warn") === action
                          ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                          : "border-dashed text-muted-foreground/40 hover:border-blue-500/20"
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
              {config.config.automodAction === "timeout" && (
                <CyberInput
                  label="durée_timeout_automod (min)"
                  value={String(config.config.automodActionDuration ?? "")}
                  onChange={(v) => updateModuleConfig("automodActionDuration", v ? Number(v) : undefined)}
                  placeholder="10"
                />
              )}
              <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3">
                <CyberInput
                  label="spam_max_messages"
                  value={String(config.config.spamMaxMessages ?? "")}
                  onChange={(v) => updateModuleConfig("spamMaxMessages", v ? Number(v) : undefined)}
                  placeholder="5"
                />
                <CyberInput
                  label="spam_window_secondes"
                  value={String(config.config.spamWindowSeconds ?? "")}
                  onChange={(v) => updateModuleConfig("spamWindowSeconds", v ? Number(v) : undefined)}
                  placeholder="5"
                />
                <CyberInput
                  label="duplicate_min_length"
                  value={String(config.config.duplicateMinLength ?? "")}
                  onChange={(v) => updateModuleConfig("duplicateMinLength", v ? Number(v) : undefined)}
                  placeholder="10"
                />
              </div>
            </div>

            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">
              — seuils de sanctions progressifs —
            </p>
            <div className="rounded-lg border border-dashed p-3 space-y-2">
              {(config.config.warnThresholdsList ?? []).map((entry: WarnThresholdEntry, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <CyberInput
                    label="warns"
                    value={String(entry.count)}
                    onChange={(v) => {
                      const list = [...(config.config.warnThresholdsList ?? [])];
                      list[i] = { ...list[i], count: Number(v) || 0 };
                      updateModuleConfig("warnThresholdsList", list);
                    }}
                    placeholder="3"
                  />
                  <div className="space-y-1 shrink-0">
                    <CyberLabel>action</CyberLabel>
                    <div className="flex gap-1">
                      {(["timeout", "kick", "ban"] as const).map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => {
                            const list = [...(config.config.warnThresholdsList ?? [])];
                            list[i] = { ...list[i], action: a };
                            updateModuleConfig("warnThresholdsList", list);
                          }}
                          className={`rounded border px-2 py-0.5 font-mono text-[9px] transition ${
                            entry.action === a
                              ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                              : "border-dashed text-muted-foreground/40 hover:border-blue-500/20"
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                  {entry.action === "timeout" && (
                    <CyberInput
                      label="durée (min)"
                      value={String(entry.duration ?? "")}
                      onChange={(v) => {
                        const list = [...(config.config.warnThresholdsList ?? [])];
                        list[i] = { ...list[i], duration: v ? Number(v) : undefined };
                        updateModuleConfig("warnThresholdsList", list);
                      }}
                      placeholder="60"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const list = (config.config.warnThresholdsList ?? []).filter((_: WarnThresholdEntry, j: number) => j !== i);
                      updateModuleConfig("warnThresholdsList", list);
                    }}
                    className="shrink-0 rounded p-1 text-muted-foreground/40 hover:text-red-500 transition"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const list = [...(config.config.warnThresholdsList ?? []), { count: 3, action: "timeout" as const, duration: 60 }];
                  updateModuleConfig("warnThresholdsList", list);
                }}
                className="flex items-center gap-1.5 rounded border border-dashed px-3 py-1.5 font-mono text-[9px] text-muted-foreground/50 hover:text-muted-foreground transition"
              >
                <Plus className="size-3" />
                ajouter un seuil
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                <Save className="size-3.5" />
                {saved ? "✓ saved" : saving ? "saving..." : "save_config"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["BAN", "KICK", "WARN", "TIMEOUT"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(filter === type ? "ALL" : type)}
            className={`rounded-lg border px-4 py-3 text-left transition ${
              filter === type
                ? (TYPE_STYLES[type] ?? "border-blue-500/30 bg-blue-500/10 text-blue-400")
                : "border-dashed hover:bg-muted/50"
            }`}
          >
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              {TYPE_ICONS[type]} {type}
            </p>
            <p className="mt-1 font-mono text-2xl font-bold">{getStatCount(type)}</p>
            <p className="font-mono text-[9px] text-muted-foreground/60">total en base</p>
          </button>
        ))}
      </div>

      {/* ── Volume 7 jours ── */}
      <div className="rounded-xl border border-dashed p-4">
        <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          volume d&apos;infractions (7j)
        </p>
        <div className="flex items-end gap-1.5 h-16">
          {volumeByDay.map(({ day, label, count }) => (
            <div key={day} className="flex flex-1 flex-col items-center gap-1">
              <span className="font-mono text-[8px] text-muted-foreground/50">{count > 0 ? count : ""}</span>
              <div
                className="w-full rounded-sm bg-blue-500/40 transition-all"
                style={{ height: `${Math.max(2, Math.round((count / maxVolume) * 48))}px` }}
                title={`${day}: ${count} infraction(s)`}
              />
              <span className="font-mono text-[8px] text-muted-foreground/50">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={`rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition ${
              filter === f
                ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                : "border-dashed text-muted-foreground/50 hover:border-blue-500/20 hover:text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto font-mono text-[10px] text-muted-foreground/40 self-center">
          {total} total
        </span>
      </div>

      {/* ── Search ── */}
      <CyberInput
        label="rechercher par utilisateur"
        value={search}
        onChange={setSearch}
        placeholder="ID ou nom d'utilisateur..."
      />

      {/* ── Infractions list ── */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed py-12 text-center">
            <p className="font-mono text-sm text-muted-foreground/50">
              {loading ? "Chargement..." : "Aucune infraction trouvée"}
            </p>
          </div>
        ) : (
          filtered.map((inf) => (
            <div
              key={inf.id}
              className="group flex items-start gap-3 rounded-lg border border-dashed p-3 transition hover:bg-muted/30"
            >
              {/* Type badge */}
              <span
                className={`mt-0.5 shrink-0 rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
                  TYPE_STYLES[inf.type] ?? "border-dashed text-muted-foreground"
                }`}
              >
                {TYPE_ICONS[inf.type] ?? "•"} {inf.type}
              </span>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  <span className="font-mono text-xs text-foreground">
                    user:{" "}
                    <span className="text-blue-400" title={inf.userId}>
                      {discordUsers[inf.userId]?.displayName ?? inf.userId}
                    </span>
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/50" title={inf.moderatorId}>
                    mod: {discordUsers[inf.moderatorId]?.displayName ?? inf.moderatorId}
                  </span>
                  {inf.duration && (
                    <span className="font-mono text-[10px] text-muted-foreground/50">
                      {inf.duration}min
                    </span>
                  )}
                  {!inf.active && (
                    <span className="rounded border border-dashed px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/40">
                      inactif
                    </span>
                  )}
                </div>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {inf.reason}
                </p>
                <p className="mt-0.5 font-mono text-[9px] text-muted-foreground/40">
                  {new Date(inf.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(inf.id)}
                disabled={deleting === inf.id}
                className="shrink-0 rounded p-1.5 text-muted-foreground/30 opacity-0 transition hover:text-red-500 group-hover:opacity-100 disabled:opacity-30"
                title="Supprimer l'infraction"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-dashed px-3 py-1.5 font-mono text-xs text-muted-foreground transition hover:bg-muted disabled:opacity-30"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <span className="font-mono text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-dashed px-3 py-1.5 font-mono text-xs text-muted-foreground transition hover:bg-muted disabled:opacity-30"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
