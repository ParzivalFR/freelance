"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";

interface Infraction {
  id: string;
  userId: string;
  moderatorId: string;
  type: string;
  reason: string;
  duration: number | null;
  active: boolean;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  WARN: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
  TIMEOUT: "text-orange-500 border-orange-500/30 bg-orange-500/10",
  KICK: "text-red-400 border-red-400/30 bg-red-400/10",
  BAN: "text-red-600 border-red-600/30 bg-red-600/10",
  UNBAN: "text-green-500 border-green-500/30 bg-green-500/10",
};

export default function BotLogsPage() {
  const [infractions, setInfractions] = useState<Infraction[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    setInfractions(null);
    fetch(`/api/bot/infractions?page=${page}&limit=${limit}`)
      .then((r) => r.json())
      .then((data) => {
        setInfractions(data.infractions ?? []);
        setTotal(data.total ?? 0);
      });
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Shield className="size-4" />}
        title="Logs système"
        subtitle="Historique des infractions et sanctions"
      />

      {/* Summary */}
      <div className="rounded-xl border border-dashed bg-card px-4 py-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          total_infractions
        </p>
        <p className="mt-1 font-mono text-2xl font-bold text-foreground">{total}</p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-dashed bg-card">
        <div className="flex items-center gap-2 border-b border-dashed px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            &gt; infractions_log
          </span>
          <span className="ml-auto font-mono text-[9px] text-muted-foreground/40">
            page {page}/{totalPages}
          </span>
        </div>

        {infractions === null ? (
          <LoadingScreen />
        ) : infractions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/30">
              aucune infraction enregistrée
            </p>
            <p className="font-mono text-[9px] text-muted-foreground/20">
              Les sanctions appliquées via les commandes de modération apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dashed">
            {infractions.map((inf) => (
              <div
                key={inf.id}
                className="flex flex-col gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="shrink-0">
                  <span
                    className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
                      TYPE_COLORS[inf.type] ?? "border-dashed text-muted-foreground"
                    }`}
                  >
                    {inf.type}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[11px] text-foreground">
                    <span className="text-muted-foreground/50">user:</span>{" "}
                    {inf.userId}
                  </p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground/60">
                    {inf.reason}
                    {inf.duration ? ` — ${inf.duration}min` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-[9px] text-muted-foreground/40">
                    {new Date(inf.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="font-mono text-[9px] text-muted-foreground/30">
                    by {inf.moderatorId.slice(0, 8)}…
                  </p>
                </div>
                {!inf.active && (
                  <div className="shrink-0">
                    <span className="font-mono text-[9px] text-muted-foreground/30">révoquée</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
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
    </div>
  );
}
