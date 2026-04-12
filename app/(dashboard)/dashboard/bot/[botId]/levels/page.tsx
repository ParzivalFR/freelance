"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Star, ChevronLeft, ChevronRight, Save, ChevronDown, ChevronUp as ChevronUpIcon, Plus, Trash2 } from "lucide-react";
import { PageHeader, LoadingScreen, CyberInput } from "@/components/dashboard/cyber-ui";
import { Switch } from "@/components/ui/switch";
import { useBotConfig } from "@/hooks/use-bot-config";
import type { LevelReward } from "@/components/dashboard/bot-types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserLevel {
  id: string;
  userId: string;
  guildId: string;
  xp: number;
  level: number;
  messages: number;
  lastXpAt?: string | null;
  createdAt: string;
}

const PAGE_SIZE = 20;

// ─── XP formula (mirrors bot-engine) ─────────────────────────────────────────
// XP needed to reach next level: 5*level^2 + 50*level + 100
function xpForNextLevel(level: number) {
  return 5 * level * level + 50 * level + 100;
}

// ─── Medal colors ─────────────────────────────────────────────────────────────
const MEDAL: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-slate-400",
  3: "text-amber-600",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LevelsPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();
  const [configOpen, setConfigOpen] = useState(false);

  const [levels, setLevels] = useState<UserLevel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLevels = useCallback(async () => {
    if (!botId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/bot/levels?botId=${botId}&page=${page}&limit=${PAGE_SIZE}`
      );
      const data = await res.json();
      setLevels(data.levels ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [botId, page]);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const offset = (page - 1) * PAGE_SIZE;

  if (!config || (loading && levels.length === 0)) return <LoadingScreen />;

  const rewards: LevelReward[] = (config.config.levelRewards as LevelReward[]) ?? [];

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Star className="size-4" />}
        title="Niveaux & XP"
        subtitle="Classement des membres les plus actifs"
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
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— xp —</p>
            <div className="grid grid-cols-3 gap-2">
              <CyberInput
                label="xp_par_message"
                value={String(config.config.xpPerMessage ?? "")}
                onChange={(v) => updateModuleConfig("xpPerMessage", v ? Number(v) : undefined)}
                placeholder="15"
              />
              <CyberInput
                label="cooldown (sec)"
                value={String(config.config.xpCooldown ?? "")}
                onChange={(v) => updateModuleConfig("xpCooldown", v ? Number(v) : undefined)}
                placeholder="60"
              />
              <CyberInput
                label="multiplicateur"
                value={String(config.config.xpMultiplier ?? "")}
                onChange={(v) => updateModuleConfig("xpMultiplier", v ? Number(v) : undefined)}
                placeholder="1"
              />
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— annonces —</p>
            <CyberInput
              label="announce_channel_id"
              value={config.config.levelAnnounceChannel ?? ""}
              onChange={(v) => updateModuleConfig("levelAnnounceChannel", v)}
              placeholder="ID salon (vide = même salon)"
            />
            <CyberInput
              label="message_level_up"
              value={config.config.levelAnnounceMessage ?? ""}
              onChange={(v) => updateModuleConfig("levelAnnounceMessage", v)}
              placeholder="GG {mention}, tu passes niveau {level} !"
            />
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— exclusions —</p>
            <CyberInput
              label="no_xp_roles (IDs virgule-séparés)"
              value={config.config.levelNoXpRoles ?? ""}
              onChange={(v) => updateModuleConfig("levelNoXpRoles", v)}
              placeholder="ROLE_ID_1, ROLE_ID_2"
            />
            <CyberInput
              label="no_xp_channels (IDs virgule-séparés)"
              value={config.config.levelNoXpChannels ?? ""}
              onChange={(v) => updateModuleConfig("levelNoXpChannels", v)}
              placeholder="CHANNEL_ID_1, CHANNEL_ID_2"
            />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] text-foreground">stack_roles</p>
                <p className="font-mono text-[9px] text-muted-foreground/60">Cumule tous les rôles de niveau (sinon seul le dernier)</p>
              </div>
              <Switch
                checked={config.config.levelStackRoles ?? false}
                onCheckedChange={(v) => updateModuleConfig("levelStackRoles", v)}
                className="scale-75"
              />
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— rôles par niveau —</p>
            <div className="space-y-2">
              {rewards.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CyberInput
                    label="niveau"
                    value={String(r.level)}
                    onChange={(v) => {
                      const next = [...rewards];
                      next[i] = { ...next[i], level: Number(v) || 0 };
                      updateModuleConfig("levelRewards", next);
                    }}
                    placeholder="5"
                  />
                  <CyberInput
                    label="role_id"
                    value={r.roleId}
                    onChange={(v) => {
                      const next = [...rewards];
                      next[i] = { ...next[i], roleId: v };
                      updateModuleConfig("levelRewards", next);
                    }}
                    placeholder="123456789012345678"
                  />
                  <button
                    type="button"
                    onClick={() => updateModuleConfig("levelRewards", rewards.filter((_, j) => j !== i))}
                    className="mt-5 shrink-0 text-muted-foreground/40 transition hover:text-red-500"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => updateModuleConfig("levelRewards", [...rewards, { level: 0, roleId: "" }])}
                className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground/40 transition hover:text-blue-400"
              >
                <Plus className="size-3" /> ajouter un rôle
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
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-dashed px-4 py-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            membres classés
          </p>
          <p className="mt-1 font-mono text-2xl font-bold">{total}</p>
        </div>
        <div className="rounded-lg border border-dashed px-4 py-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            niveau max
          </p>
          <p className="mt-1 font-mono text-2xl font-bold">
            {levels[0]?.level ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-dashed px-4 py-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            xp total
          </p>
          <p className="mt-1 font-mono text-2xl font-bold">
            {levels
              .reduce((acc, u) => acc + u.xp, 0)
              .toLocaleString("fr-FR")}
          </p>
        </div>
      </div>

      {/* ── Leaderboard ── */}
      <div className="overflow-hidden rounded-lg border border-dashed">
        {/* Header */}
        <div className="grid grid-cols-[2.5rem_1fr_5rem_5rem_5rem] gap-3 border-b border-dashed px-4 py-2">
          {["#", "utilisateur", "niveau", "xp", "messages"].map((h) => (
            <span
              key={h}
              className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50"
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {levels.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-mono text-sm text-muted-foreground/50">
              {loading ? "Chargement..." : "Aucun membre classé"}
            </p>
          </div>
        ) : (
          levels.map((user, i) => {
            const rank = offset + i + 1;
            const nextXp = xpForNextLevel(user.level);
            const progress = Math.min(100, Math.round((user.xp / nextXp) * 100));
            return (
              <div
                key={user.id}
                className="group grid grid-cols-[2.5rem_1fr_5rem_5rem_5rem] items-center gap-3 border-b border-dashed px-4 py-3 last:border-b-0 transition hover:bg-muted/30"
              >
                {/* Rank */}
                <span
                  className={`font-mono text-sm font-bold ${
                    MEDAL[rank] ?? "text-muted-foreground/40"
                  }`}
                >
                  {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
                </span>

                {/* User ID + progress */}
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-foreground">
                    {user.userId}
                  </p>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-0.5 font-mono text-[9px] text-muted-foreground/40">
                    {user.xp} / {nextXp} xp vers niv. {user.level + 1}
                  </p>
                </div>

                {/* Level */}
                <span className="font-mono text-sm font-bold text-blue-400">
                  {user.level}
                </span>

                {/* XP */}
                <span className="font-mono text-xs text-muted-foreground">
                  {user.xp.toLocaleString("fr-FR")}
                </span>

                {/* Messages */}
                <span className="font-mono text-xs text-muted-foreground">
                  {user.messages.toLocaleString("fr-FR")}
                </span>
              </div>
            );
          })
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
