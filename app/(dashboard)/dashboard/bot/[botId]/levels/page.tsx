"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";

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

  if (loading && levels.length === 0) return <LoadingScreen />;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Star className="size-4" />}
        title="Niveaux & XP"
        subtitle="Classement des membres les plus actifs"
      />

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
