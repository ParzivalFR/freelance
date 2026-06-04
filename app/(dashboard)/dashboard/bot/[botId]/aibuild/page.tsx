"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useDiscordUsers } from "@/hooks/use-discord-users";

interface Generation {
  id: string;
  guildId: string;
  userId: string;
  serverType: string | null;
  concept: string | null;
  style: string | null;
  complexity: string | null;
  structure: {
    roles?: Array<{ name: string; color: string }>;
    categories?: Array<{ name: string; channels: Array<{ name: string; type: string }> }>;
  };
  status: string;
  createdAt: string;
  appliedAt: string | null;
}

interface Stats {
  total: number;
  applied: number;
  cancelled: number;
  pending: number;
}

interface Quota {
  used: number;
  limit: number;
  resetDate: string;
}

export default function AiBuildPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config } = useBotConfig();

  const [generations, setGenerations] = useState<Generation[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, applied: 0, cancelled: 0, pending: 0 });
  const [quota, setQuota] = useState<Quota | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!botId) return;
    fetch(`/api/bot/aibuild?botId=${botId}`)
      .then((r) => r.json())
      .then((data) => {
        setGenerations(data.generations ?? []);
        setStats(data.stats);
        setQuota(data.quota);
      })
      .finally(() => setLoading(false));
  }, [botId]);

  const userIds = Array.from(new Set(generations.map((g) => g.userId)));
  const { users } = useDiscordUsers(botId, userIds);

  if (!config) return <LoadingScreen />;

  const planLabel = config.plan === "PRO" ? "PRO (3/semaine)" : config.plan === "MANAGED" ? "MANAGED (illimité)" : "FREE (1 à vie)";

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Sparkles className="size-4" />}
        title="AI Build Server"
        subtitle="L'IA construit ton serveur Discord complet en quelques secondes"
        status={config.status}
      />

      {/* Quota & explication */}
      <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Sparkles className="size-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-mono text-[11px] text-foreground leading-relaxed">
              Active le module, puis utilise <code className="text-purple-400">/build-server</code> dans Discord (admin requis).
              L'IA te proposera une structure complète (rôles + catégories + salons), tu peux la modifier ou l'appliquer en un clic.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-dashed bg-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">générations</p>
          <p className="font-mono text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-dashed bg-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">appliquées</p>
          <p className="font-mono text-2xl font-bold text-green-500">{stats.applied}</p>
        </div>
        <div className="rounded-xl border border-dashed bg-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">en attente</p>
          <p className="font-mono text-2xl font-bold text-yellow-500">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-dashed bg-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">quota actuel</p>
          <p className="font-mono text-2xl font-bold text-purple-400">
            {quota ? `${quota.used}/${quota.limit}` : "—"}
          </p>
          {quota && (
            <p className="font-mono text-[9px] text-muted-foreground/60 mt-1">
              reset {new Date(quota.resetDate).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-dashed bg-card p-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">plan actuel</p>
        <p className="font-mono text-sm font-bold text-foreground mt-1">{planLabel}</p>
      </div>

      {/* Historique */}
      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">historique des générations</p>
        {loading ? (
          <p className="font-mono text-[10px] text-muted-foreground/60">Chargement...</p>
        ) : generations.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-8 text-center">
            <p className="font-mono text-[11px] text-muted-foreground/60">
              Aucune génération pour le moment. Utilise <code className="text-foreground">/build-server</code> dans Discord pour commencer.
            </p>
          </div>
        ) : (
          generations.map((g) => {
            const user = users[g.userId];
            const isExpanded = expanded === g.id;
            const rolesCount = g.structure?.roles?.length ?? 0;
            const categoriesCount = g.structure?.categories?.length ?? 0;
            const channelsCount = g.structure?.categories?.reduce((acc, c) => acc + (c.channels?.length ?? 0), 0) ?? 0;

            return (
              <div key={g.id} className="rounded-xl border border-dashed bg-card p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-2 shrink-0 rounded-full ${
                      g.status === "applied" ? "bg-green-500" : g.status === "cancelled" ? "bg-red-500" : "bg-yellow-500"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] font-bold text-foreground truncate">
                      {g.serverType ?? "—"} · {g.style ?? "—"} · {g.complexity ?? "—"}
                    </p>
                    <p className="font-mono text-[9px] text-muted-foreground/60">
                      {user?.displayName ?? g.userId} · {new Date(g.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <div className="hidden sm:flex gap-3 font-mono text-[10px] text-muted-foreground">
                    <span>{rolesCount} rôles</span>
                    <span>{categoriesCount} cat.</span>
                    <span>{channelsCount} salons</span>
                  </div>
                  <span
                    className={`font-mono text-[9px] uppercase tracking-widest ${
                      g.status === "applied" ? "text-green-500" : g.status === "cancelled" ? "text-red-400" : "text-yellow-500"
                    }`}
                  >
                    {g.status === "applied" ? "appliquée" : g.status === "cancelled" ? "annulée" : "en attente"}
                  </span>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : g.id)}
                    className="rounded border border-dashed bg-background p-1.5 text-muted-foreground hover:text-foreground"
                  >
                    {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 ml-5 space-y-3 border-l-2 border-dashed border-purple-500/30 pl-4">
                    {g.concept && (
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">concept</p>
                        <p className="font-mono text-[11px] text-foreground/80 mt-0.5">{g.concept}</p>
                      </div>
                    )}
                    {g.structure?.roles && g.structure.roles.length > 0 && (
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">rôles ({g.structure.roles.length})</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {g.structure.roles.map((r, i) => (
                            <span key={i} className="font-mono text-[10px] rounded px-1.5 py-0.5" style={{ background: r.color + "20", color: r.color }}>
                              {r.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {g.structure?.categories && g.structure.categories.length > 0 && (
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">structure</p>
                        <div className="space-y-2 mt-1">
                          {g.structure.categories.map((cat, i) => (
                            <div key={i} className="font-mono text-[10px]">
                              <p className="text-foreground font-bold">📂 {cat.name}</p>
                              <p className="text-muted-foreground/70 pl-4">
                                {cat.channels?.map((c) => `${c.type === "voice" ? "🔊" : "#"}${c.name}`).join(" · ")}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
