"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  BarChart2, Plus, X, ChevronDown, ChevronUp,
  Trash2, StopCircle, RefreshCw, Eye, EyeOff,
} from "lucide-react";
import { PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { Switch } from "@/components/ui/switch";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PollOption {
  id: string;
  label: string;
  emoji?: string;
}

interface PollAnalyticsResult {
  optionId: string;
  label: string;
  emoji?: string;
  votes?: number;
  weightedVotes?: number;
  percentage?: number;
  weightedPercentage?: number;
  bordaScore?: number;
}

interface PollAnalytics {
  type: string;
  totalVoters: number;
  totalWeightedVotes?: number;
  results: PollAnalyticsResult[];
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  isBlind: boolean;
  isAnonymous: boolean;
  allowMultiple: boolean;
  allowChange: boolean;
  maxChoices: number;
  minVotes: number;
  autoThread: boolean;
  isRecurring: boolean;
  recurInterval?: string;
  guildId: string;
  channelId: string;
  messageId?: string;
  options: PollOption[];
  roleWeights?: Record<string, number>;
  allowedRoleIds?: string[];
  endsAt?: string;
  startsAt?: string;
  color?: string;
  colorClosed?: string;
  useEmbed: boolean;
  createdAt: string;
  _count: { votes: number };
  analytics?: PollAnalytics;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "border-green-500/30 bg-green-500/10 text-green-500",
  CLOSED: "border-muted-foreground/20 bg-muted/30 text-muted-foreground",
  PENDING: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
};

const TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: "choix multiple",
  YES_NO: "oui / non",
  RANKED: "classement",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function buildYesNoOptions(): PollOption[] {
  return [
    { id: uid(), label: "Oui", emoji: "✅" },
    { id: uid(), label: "Non", emoji: "❌" },
  ];
}

// ─── Poll Result Bar ──────────────────────────────────────────────────────────

function ResultBar({
  result,
  isRanked,
  isWeighted,
}: {
  result: PollAnalyticsResult;
  isRanked: boolean;
  isWeighted: boolean;
}) {
  const pct = isRanked
    ? (result.percentage ?? 0)
    : isWeighted
    ? (result.weightedPercentage ?? 0)
    : (result.percentage ?? 0);

  const value = isRanked
    ? `${result.bordaScore} pts`
    : isWeighted
    ? `${result.weightedVotes} pts (${result.percentage}%)`
    : `${result.votes} vote${(result.votes ?? 0) > 1 ? "s" : ""} — ${result.percentage}%`;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-foreground">
          {result.emoji ? `${result.emoji} ` : ""}{result.label}
        </span>
        <span className="font-mono text-[9px] text-muted-foreground/60">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Poll Card ────────────────────────────────────────────────────────────────

function PollCard({
  poll,
  onClose,
  onDelete,
  onExpand,
  expanded,
}: {
  poll: Poll;
  onClose: (id: string) => void;
  onDelete: (id: string) => void;
  onExpand: (id: string) => void;
  expanded: boolean;
}) {
  const isActive = poll.status === "ACTIVE";
  const hasWeights = poll.roleWeights && Object.keys(poll.roleWeights).length > 0;
  const isWeighted = !!hasWeights;

  const canShowResults =
    poll.analytics &&
    (!poll.isBlind || poll.status === "CLOSED") &&
    poll.analytics.totalVoters >= poll.minVotes;

  return (
    <div className="rounded-xl border border-dashed bg-card transition-all">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-dashed bg-muted text-blue-400">
          <BarChart2 className="size-3.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest ${
                STATUS_COLORS[poll.status] ?? "border-dashed text-muted-foreground"
              }`}
            >
              {poll.status}
            </span>
            <span className="rounded border border-dashed px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest text-muted-foreground/50">
              {TYPE_LABELS[poll.type] ?? poll.type}
            </span>
            {poll.isBlind && (
              <span className="flex items-center gap-0.5 rounded border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest text-purple-400">
                <EyeOff className="size-2.5" /> aveugle
              </span>
            )}
            {poll.isAnonymous && (
              <span className="rounded border border-orange-500/30 bg-orange-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest text-orange-400">
                anonyme
              </span>
            )}
            {isWeighted && (
              <span className="rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest text-cyan-400">
                pondéré
              </span>
            )}
            {poll.isRecurring && (
              <span className="flex items-center gap-0.5 rounded border border-green-500/30 bg-green-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest text-green-400">
                <RefreshCw className="size-2.5" /> {poll.recurInterval}
              </span>
            )}
          </div>

          <p className="mt-1.5 font-mono text-sm font-bold text-foreground">{poll.title}</p>
          {poll.description && (
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/60 line-clamp-1">
              {poll.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="font-mono text-[9px] text-muted-foreground/40">
              {poll._count.votes} votant{poll._count.votes > 1 ? "s" : ""}
            </span>
            <span className="font-mono text-[9px] text-muted-foreground/40">
              {poll.options.length} options
            </span>
            {poll.endsAt && (
              <span className="font-mono text-[9px] text-muted-foreground/40">
                fin:{" "}
                {new Date(poll.endsAt).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <span className="font-mono text-[9px] text-muted-foreground/30">
              {new Date(poll.createdAt).toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {isActive && (
            <button
              onClick={() => onClose(poll.id)}
              title="Fermer le sondage"
              className="rounded border border-dashed p-1.5 font-mono text-[9px] text-muted-foreground/50 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              <StopCircle className="size-3.5" />
            </button>
          )}
          <button
            onClick={() => onDelete(poll.id)}
            title="Supprimer"
            className="rounded border border-dashed p-1.5 text-muted-foreground/50 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="size-3.5" />
          </button>
          <button
            onClick={() => onExpand(poll.id)}
            title={expanded ? "Réduire" : "Voir les résultats"}
            className="rounded border border-dashed p-1.5 text-muted-foreground/50 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
          >
            {expanded ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded: résultats */}
      {expanded && (
        <div className="border-t border-dashed px-4 pb-4 pt-3">
          {!poll.analytics ? (
            <p className="font-mono text-[10px] text-muted-foreground/30">Chargement...</p>
          ) : !canShowResults ? (
            <div className="flex items-center gap-2 rounded-lg border border-dashed p-3">
              <EyeOff className="size-3.5 shrink-0 text-purple-400" />
              <p className="font-mono text-[10px] text-muted-foreground/60">
                {poll.isBlind && poll.status !== "CLOSED"
                  ? "Résultats visibles après fermeture du sondage."
                  : `Résultats visibles à partir de ${poll.minVotes} votes. (${poll.analytics.totalVoters} actuellement)`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">
                  résultats — {poll.analytics.totalVoters} votant{poll.analytics.totalVoters > 1 ? "s" : ""}
                  {isWeighted && poll.analytics.totalWeightedVotes !== undefined && (
                    <> · {poll.analytics.totalWeightedVotes} pts pondérés</>
                  )}
                </span>
                {poll.minVotes > 0 && (
                  <span className="font-mono text-[9px] text-muted-foreground/30">
                    seuil: {poll.minVotes} votes
                  </span>
                )}
              </div>

              {poll.analytics.results.map((r) => (
                <ResultBar
                  key={r.optionId}
                  result={r}
                  isRanked={poll.type === "RANKED"}
                  isWeighted={isWeighted}
                />
              ))}

              {isWeighted && (
                <div className="mt-3 rounded-lg border border-dashed p-2">
                  <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/30">
                    pondérations par rôle
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {Object.entries(poll.roleWeights ?? {}).map(([roleId, w]) => (
                      <span
                        key={roleId}
                        className="rounded border border-cyan-500/20 bg-cyan-500/5 px-1.5 py-0.5 font-mono text-[9px] text-cyan-400"
                      >
                        {roleId}: ×{w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {poll.type === "RANKED" && (
                <p className="mt-1 font-mono text-[8px] text-muted-foreground/30">
                  Score calculé via méthode Borda (rang → points)
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Create Poll Form ─────────────────────────────────────────────────────────

interface CreateForm {
  title: string;
  description: string;
  guildId: string;
  channelId: string;
  type: "MULTIPLE_CHOICE" | "YES_NO" | "RANKED";
  options: PollOption[];
  isBlind: boolean;
  isAnonymous: boolean;
  allowMultiple: boolean;
  allowChange: boolean;
  maxChoices: number;
  minVotes: number;
  autoThread: boolean;
  endsAt: string;
  isRecurring: boolean;
  recurInterval: string;
  roleWeightsRaw: string; // JSON textarea
  color: string;
  colorClosed: string;
  useEmbed: boolean;
}

const defaultForm: CreateForm = {
  title: "",
  description: "",
  guildId: "",
  channelId: "",
  type: "MULTIPLE_CHOICE",
  options: [
    { id: uid(), label: "", emoji: "" },
    { id: uid(), label: "", emoji: "" },
  ],
  isBlind: false,
  isAnonymous: false,
  allowMultiple: false,
  allowChange: true,
  maxChoices: 1,
  minVotes: 0,
  autoThread: false,
  endsAt: "",
  isRecurring: false,
  recurInterval: "weekly",
  roleWeightsRaw: "",
  color: "",
  colorClosed: "",
  useEmbed: true,
};

function CreatePollForm({
  botId,
  onCreated,
  onCancel,
}: {
  botId: string;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CreateForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof CreateForm>(k: K, v: CreateForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setOption = (idx: number, field: keyof PollOption, val: string) =>
    setForm((f) => {
      const opts = [...f.options];
      opts[idx] = { ...opts[idx], [field]: val };
      return { ...f, options: opts };
    });

  const addOption = () =>
    setForm((f) => ({
      ...f,
      options: [...f.options, { id: uid(), label: "", emoji: "" }],
    }));

  const removeOption = (idx: number) =>
    setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== idx) }));

  const handleTypeChange = (t: CreateForm["type"]) => {
    if (t === "YES_NO") {
      setForm((f) => ({ ...f, type: t, options: buildYesNoOptions(), allowMultiple: false }));
    } else {
      setForm((f) => ({ ...f, type: t }));
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.title.trim()) return setError("Le titre est requis.");
    if (!form.guildId.trim()) return setError("L'ID du serveur est requis.");
    if (!form.channelId.trim()) return setError("L'ID du salon est requis.");
    const validOptions = form.options.filter((o) => o.label.trim());
    if (validOptions.length < 2) return setError("Minimum 2 options.");

    let roleWeights: Record<string, number> | null = null;
    if (form.roleWeightsRaw.trim()) {
      try {
        roleWeights = JSON.parse(form.roleWeightsRaw);
      } catch {
        return setError("Format roleWeights invalide (JSON attendu).");
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bot/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId,
          guildId: form.guildId.trim(),
          channelId: form.channelId.trim(),
          title: form.title.trim(),
          description: form.description.trim() || null,
          type: form.type,
          options: validOptions.map((o) => ({
            id: o.id,
            label: o.label.trim(),
            ...(o.emoji?.trim() && { emoji: o.emoji.trim() }),
          })),
          isBlind: form.isBlind,
          isAnonymous: form.isAnonymous,
          allowMultiple: form.allowMultiple,
          allowChange: form.allowChange,
          maxChoices: form.allowMultiple ? form.maxChoices : 1,
          minVotes: form.minVotes,
          autoThread: form.autoThread,
          endsAt: form.endsAt || null,
          isRecurring: form.isRecurring,
          recurInterval: form.isRecurring ? form.recurInterval : null,
          roleWeights,
          color: form.color.trim() || null,
          colorClosed: form.colorClosed.trim() || null,
          useEmbed: form.useEmbed,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        return setError(d.error ?? "Erreur lors de la création.");
      }
      onCreated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-blue-500/30 bg-blue-500/5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-500/20 px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-blue-400">
          &gt; nouveau_sondage
        </span>
        <button onClick={onCancel} className="text-muted-foreground/40 transition hover:text-foreground">
          <X className="size-3.5" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        {/* Basique */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
              titre *
            </label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Quelle fonctionnalité voulez-vous ?"
              className="w-full rounded-lg border border-dashed bg-background px-3 py-2 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/30 focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
              description
            </label>
            <input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Contexte additionnel..."
              className="w-full rounded-lg border border-dashed bg-background px-3 py-2 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/30 focus:border-blue-500/50"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
              server_id *
            </label>
            <input
              value={form.guildId}
              onChange={(e) => set("guildId", e.target.value)}
              placeholder="123456789012345678"
              className="w-full rounded-lg border border-dashed bg-background px-3 py-2 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/30 focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
              channel_id *
            </label>
            <input
              value={form.channelId}
              onChange={(e) => set("channelId", e.target.value)}
              placeholder="123456789012345678"
              className="w-full rounded-lg border border-dashed bg-background px-3 py-2 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/30 focus:border-blue-500/50"
            />
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="mb-2 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
            type
          </label>
          <div className="flex gap-2">
            {(["MULTIPLE_CHOICE", "YES_NO", "RANKED"] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className={`rounded-lg border px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest transition ${
                  form.type === t
                    ? "border-blue-500/50 bg-blue-500/20 text-blue-400"
                    : "border-dashed text-muted-foreground/40 hover:border-muted-foreground/30 hover:text-muted-foreground"
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          {form.type === "RANKED" && (
            <p className="mt-1.5 font-mono text-[9px] text-muted-foreground/40">
              Les votes seront calculés via la méthode Borda (rang → points pondérés)
            </p>
          )}
        </div>

        {/* Options */}
        <div>
          <label className="mb-2 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
            options ({form.options.length}/10)
          </label>
          <div className="space-y-2">
            {form.options.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  value={opt.emoji ?? ""}
                  onChange={(e) => setOption(idx, "emoji", e.target.value)}
                  placeholder="emoji"
                  className="w-14 rounded-lg border border-dashed bg-background px-2 py-1.5 text-center font-mono text-xs outline-none placeholder:text-muted-foreground/20 focus:border-blue-500/50"
                />
                <input
                  value={opt.label}
                  onChange={(e) => setOption(idx, "label", e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 rounded-lg border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/30 focus:border-blue-500/50"
                />
                {form.options.length > 2 && form.type !== "YES_NO" && (
                  <button
                    onClick={() => removeOption(idx)}
                    className="shrink-0 text-muted-foreground/30 transition hover:text-red-400"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {form.type !== "YES_NO" && form.options.length < 10 && (
            <button
              onClick={addOption}
              className="mt-2 flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground/40 transition hover:text-blue-400"
            >
              <Plus className="size-3" /> ajouter une option
            </button>
          )}
        </div>

        {/* Settings */}
        <div className="rounded-lg border border-dashed p-3">
          <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">
            comportement
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { key: "isBlind" as const, label: "vote_aveugle", desc: "résultats cachés avant fermeture" },
              { key: "isAnonymous" as const, label: "anonyme", desc: "cache qui a voté" },
              { key: "allowChange" as const, label: "vote_modifiable", desc: "peut changer son vote" },
              { key: "autoThread" as const, label: "auto_thread", desc: "crée un thread de discussion" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-2 py-1">
                <div>
                  <span className="font-mono text-[9px] text-foreground">{label}</span>
                  <p className="font-mono text-[8px] text-muted-foreground/40">{desc}</p>
                </div>
                <Switch
                  checked={form[key] as boolean}
                  onCheckedChange={(v) => set(key, v)}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          {form.type !== "YES_NO" && form.type !== "RANKED" && (
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-dashed pt-2">
              <div>
                <span className="font-mono text-[9px] text-foreground">multi_choix</span>
                <p className="font-mono text-[8px] text-muted-foreground/40">plusieurs options sélectionnables</p>
              </div>
              <Switch
                checked={form.allowMultiple}
                onCheckedChange={(v) => set("allowMultiple", v)}
                className="scale-75"
              />
            </div>
          )}

          {form.allowMultiple && (
            <div className="mt-2 flex items-center gap-3 border-t border-dashed pt-2">
              <span className="font-mono text-[9px] text-muted-foreground/60">max_choix</span>
              <input
                type="number"
                min={2}
                max={10}
                value={form.maxChoices}
                onChange={(e) => set("maxChoices", parseInt(e.target.value) || 2)}
                className="w-16 rounded border border-dashed bg-background px-2 py-1 text-center font-mono text-xs outline-none focus:border-blue-500/50"
              />
            </div>
          )}
        </div>

        {/* Seuil + planification */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
              min_votes (seuil révélation)
            </label>
            <input
              type="number"
              min={0}
              value={form.minVotes}
              onChange={(e) => set("minVotes", parseInt(e.target.value) || 0)}
              placeholder="0 = immédiat"
              className="w-full rounded-lg border border-dashed bg-background px-3 py-2 font-mono text-xs outline-none placeholder:text-muted-foreground/30 focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
              fermeture_auto (date/heure)
            </label>
            <input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => set("endsAt", e.target.value)}
              className="w-full rounded-lg border border-dashed bg-background px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        {/* Récurrence */}
        <div className="flex items-center gap-4 rounded-lg border border-dashed p-3">
          <div className="flex items-center justify-between flex-1 gap-2">
            <div>
              <span className="font-mono text-[9px] text-foreground">récurrent</span>
              <p className="font-mono text-[8px] text-muted-foreground/40">reposte automatiquement</p>
            </div>
            <Switch
              checked={form.isRecurring}
              onCheckedChange={(v) => set("isRecurring", v)}
              className="scale-75"
            />
          </div>
          {form.isRecurring && (
            <select
              value={form.recurInterval}
              onChange={(e) => set("recurInterval", e.target.value)}
              className="rounded border border-dashed bg-background px-2 py-1 font-mono text-[10px] text-foreground outline-none focus:border-blue-500/50"
            >
              <option value="daily">quotidien</option>
              <option value="weekly">hebdomadaire</option>
              <option value="monthly">mensuel</option>
            </select>
          )}
        </div>

        {/* Role weights */}
        <div>
          <label className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
            role_weights (JSON) — optionnel
          </label>
          <textarea
            value={form.roleWeightsRaw}
            onChange={(e) => set("roleWeightsRaw", e.target.value)}
            placeholder={'{"ROLE_ID_1": 2, "ROLE_ID_2": 1.5}'}
            rows={2}
            className="w-full resize-none rounded-lg border border-dashed bg-background px-3 py-2 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/20 focus:border-blue-500/50"
          />
          <p className="mt-1 font-mono text-[8px] text-muted-foreground/30">
            Attribue un poids différent aux votes selon le rôle Discord. Ex: les Boosters comptent double.
          </p>
        </div>

        {/* Apparence */}
        <div className="rounded-lg border border-dashed p-3">
          <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">
            apparence
          </p>

          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[9px] text-foreground">embed_discord</span>
              <p className="font-mono text-[8px] text-muted-foreground/40">affiche le sondage en embed (sinon texte brut)</p>
            </div>
            <Switch
              checked={form.useEmbed}
              onCheckedChange={(v) => set("useEmbed", v)}
              className="scale-75"
            />
          </div>

          {form.useEmbed && (
            <div className="grid gap-3 sm:grid-cols-2 border-t border-dashed pt-3">
              <div>
                <label className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
                  couleur_active
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color ? `#${form.color}` : "#5865f2"}
                    onChange={(e) => set("color", e.target.value.replace("#", ""))}
                    className="h-8 w-10 cursor-pointer rounded border border-dashed bg-background p-0.5"
                  />
                  <input
                    value={form.color}
                    onChange={(e) => set("color", e.target.value.replace("#", ""))}
                    placeholder="5865f2 (optionnel)"
                    maxLength={6}
                    className="flex-1 rounded-lg border border-dashed bg-background px-3 py-2 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/30 focus:border-blue-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
                  couleur_fermé
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.colorClosed ? `#${form.colorClosed}` : "#4b5563"}
                    onChange={(e) => set("colorClosed", e.target.value.replace("#", ""))}
                    className="h-8 w-10 cursor-pointer rounded border border-dashed bg-background p-0.5"
                  />
                  <input
                    value={form.colorClosed}
                    onChange={(e) => set("colorClosed", e.target.value.replace("#", ""))}
                    placeholder="4b5563 (optionnel)"
                    maxLength={6}
                    className="flex-1 rounded-lg border border-dashed bg-background px-3 py-2 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/30 focus:border-blue-500/50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-[10px] text-red-400">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-dashed px-4 py-2 font-mono text-xs text-muted-foreground/50 transition hover:text-foreground"
          >
            annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/20 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-blue-400 transition hover:bg-blue-500/30 disabled:opacity-50"
          >
            <Plus className="size-3.5" />
            {submitting ? "création..." : "créer_sondage"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BotPollsPage() {
  const params = useParams();
  const botId = params?.botId as string;

  const [polls, setPolls] = useState<Poll[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const limit = 15;

  const load = useCallback(() => {
    if (!botId) return;
    setPolls(null);
    fetch(`/api/bot/polls?botId=${botId}&page=${page}&limit=${limit}`)
      .then((r) => r.json())
      .then((data) => {
        setPolls(data.polls ?? []);
        setTotal(data.total ?? 0);
      });
  }, [botId, page]);

  useEffect(() => { load(); }, [load]);

  // Charger les analytics quand on expand un poll
  const handleExpand = useCallback(async (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setPolls((prev) =>
      (prev ?? []).map((p) => {
        if (p.id !== id || p.analytics) return p;
        // fetch analytics
        fetch(`/api/bot/polls/${id}`)
          .then((r) => r.json())
          .then((data) => {
            setPolls((prev2) =>
              (prev2 ?? []).map((p2) =>
                p2.id === id ? { ...p2, analytics: data.analytics } : p2
              )
            );
          });
        return p;
      })
    );
  }, []);

  const handleClose = async (id: string) => {
    await fetch(`/api/bot/polls/${id}/close`, { method: "POST" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce sondage et tous ses votes ?")) return;
    await fetch(`/api/bot/polls/${id}`, { method: "DELETE" });
    load();
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const activeCount = (polls ?? []).filter((p) => p.status === "ACTIVE").length;
  const totalVoters = (polls ?? []).reduce((s, p) => s + p._count.votes, 0);

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<BarChart2 className="size-4" />}
        title="Sondages"
        subtitle="Gestion et analytics des sondages Discord"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "total_sondages", value: total },
          { label: "actifs", value: activeCount, color: "text-green-400" },
          { label: "votes_enregistrés", value: totalVoters, color: "text-blue-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-dashed bg-card px-4 py-3">
            <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/40">
              {label}
            </p>
            <p className={`mt-1 font-mono text-2xl font-bold ${color ?? "text-foreground"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Create button / form */}
      {!showCreate ? (
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-blue-400 transition hover:bg-blue-500/20"
        >
          <Plus className="size-3.5" />
          créer un sondage
        </button>
      ) : (
        <CreatePollForm
          botId={botId}
          onCreated={() => { setShowCreate(false); setPage(1); load(); }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* List */}
      <div className="rounded-xl border border-dashed bg-card">
        <div className="flex items-center justify-between border-b border-dashed px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            &gt; polls_list
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="text-muted-foreground/30 transition hover:text-foreground"
              title="Rafraîchir"
            >
              <RefreshCw className="size-3.5" />
            </button>
            <span className="font-mono text-[9px] text-muted-foreground/40">
              {page}/{totalPages}
            </span>
          </div>
        </div>

        {polls === null ? (
          <LoadingScreen />
        ) : polls.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <Eye className="size-8 text-muted-foreground/20" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/30">
              aucun sondage créé
            </p>
            <p className="font-mono text-[9px] text-muted-foreground/20">
              Crée un sondage ou utilise /poll dans Discord
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dashed">
            {polls.map((poll) => (
              <div key={poll.id} className="p-3">
                <PollCard
                  poll={poll}
                  onClose={handleClose}
                  onDelete={handleDelete}
                  onExpand={handleExpand}
                  expanded={expandedId === poll.id}
                />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-dashed px-4 py-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded border border-dashed px-2.5 py-1 font-mono text-[10px] text-muted-foreground transition hover:bg-muted disabled:opacity-30"
            >
              ← prev
            </button>
            <span className="font-mono text-[10px] text-muted-foreground/50">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded border border-dashed px-2.5 py-1 font-mono text-[10px] text-muted-foreground transition hover:bg-muted disabled:opacity-30"
            >
              next →
            </button>
          </div>
        )}
      </div>

      {/* Doc API pour le bot-engine */}
      <div className="rounded-xl border border-dashed p-4">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">
          bot_engine — endpoints disponibles
        </p>
        <div className="space-y-1">
          {[
            ["GET",    `/api/bot/polls?botId={id}`,              "Liste les sondages actifs"],
            ["POST",   `/api/bot/polls/{id}/vote`,               "Enregistre un vote (x-bot-api-key)"],
            ["DELETE", `/api/bot/polls/{id}/vote`,               "Retire un vote (x-bot-api-key)"],
            ["POST",   `/api/bot/polls/{id}/close`,              "Ferme un sondage (x-bot-api-key)"],
            ["PATCH",  `/api/bot/polls/{id}`,                    "Met à jour messageId / threadId"],
          ].map(([method, path, desc]) => (
            <div key={path} className="flex items-start gap-3">
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[8px] font-bold ${
                  method === "GET" ? "bg-green-500/10 text-green-400" :
                  method === "POST" ? "bg-blue-500/10 text-blue-400" :
                  method === "DELETE" ? "bg-red-500/10 text-red-400" :
                  "bg-yellow-500/10 text-yellow-400"
                }`}
              >
                {method}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground/60">{path}</span>
              <span className="font-mono text-[9px] text-muted-foreground/30">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
