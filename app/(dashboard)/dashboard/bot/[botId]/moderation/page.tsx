"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Shield, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";

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

  if (loading && infractions.length === 0) return <LoadingScreen />;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Shield className="size-4" />}
        title="Modération"
        subtitle="Historique des infractions"
      />

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
