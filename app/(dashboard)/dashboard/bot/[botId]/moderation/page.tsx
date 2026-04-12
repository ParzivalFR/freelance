"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Shield, Trash2, ChevronLeft, ChevronRight, Save, ChevronDown, ChevronUp as ChevronUpIcon } from "lucide-react";
import { PageHeader, LoadingScreen, CyberInput, CyberLabel } from "@/components/dashboard/cyber-ui";
import { Switch } from "@/components/ui/switch";
import { useBotConfig } from "@/hooks/use-bot-config";

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
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const filtered =
    filter === "ALL"
      ? infractions
      : infractions.filter((inf) => inf.type === filter);

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
            <CyberInput
              label="log_channel_id"
              value={config.config.logChannelId ?? ""}
              onChange={(v) => updateModuleConfig("logChannelId", v)}
              placeholder="ID salon de logs des sanctions"
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
        {(["BAN", "KICK", "WARN", "TIMEOUT"] as const).map((type) => {
          const count = infractions.filter((i) => i.type === type).length;
          return (
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
              <p className="mt-1 font-mono text-2xl font-bold">{count}</p>
              <p className="font-mono text-[9px] text-muted-foreground/60">
                sur cette page
              </p>
            </button>
          );
        })}
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
                    <span className="text-blue-400">{inf.userId}</span>
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/50">
                    mod: {inf.moderatorId}
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
