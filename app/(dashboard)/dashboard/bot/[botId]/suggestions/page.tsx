"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Lightbulb, Save, Check, X, Trash2 } from "lucide-react";
import { PageHeader, LoadingScreen, CyberInput } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { ChannelSelect, RoleSelect } from "@/components/dashboard/discord-select";
import { useDiscordUsers } from "@/hooks/use-discord-users";

interface Suggestion {
  id: string;
  userId: string;
  content: string;
  status: string;
  upvotes: string[];
  downvotes: string[];
  response: string | null;
  respondedBy: string | null;
  createdAt: string;
}

export default function SuggestionsPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");

  const fetchSuggestions = async () => {
    if (!botId) return;
    setLoading(true);
    const res = await fetch(`/api/bot/suggestions?botId=${botId}`);
    if (res.ok) {
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuggestions();
    const interval = setInterval(fetchSuggestions, 15_000);
    return () => clearInterval(interval);
  }, [botId]);

  const userIds = Array.from(new Set(suggestions.map((s) => s.userId)));
  const { users } = useDiscordUsers(botId, userIds);

  const handleAction = async (id: string, status: "accepted" | "rejected") => {
    await fetch("/api/bot/suggestions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, response: responseText || null }),
    });
    setRespondingId(null);
    setResponseText("");
    await fetchSuggestions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette suggestion ?")) return;
    await fetch(`/api/bot/suggestions?id=${id}`, { method: "DELETE" });
    await fetchSuggestions();
  };

  if (!config) return <LoadingScreen />;

  const cfg = (config.config.suggestions ?? {}) as Record<string, unknown>;
  const update = (k: string, v: unknown) =>
    updateModuleConfig("suggestions" as never, { ...cfg, [k]: v } as never);

  const filtered = filter === "all" ? suggestions : suggestions.filter((s) => s.status === filter);

  const stats = {
    total: suggestions.length,
    pending: suggestions.filter((s) => s.status === "pending").length,
    accepted: suggestions.filter((s) => s.status === "accepted").length,
    rejected: suggestions.filter((s) => s.status === "rejected").length,
  };

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Lightbulb className="size-4" />}
        title="Suggestions"
        subtitle="Système de suggestions avec votes pour/contre"
        status={config.status}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-dashed bg-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">total</p>
          <p className="font-mono text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-dashed bg-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">en attente</p>
          <p className="font-mono text-2xl font-bold text-yellow-500">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-dashed bg-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">acceptées</p>
          <p className="font-mono text-2xl font-bold text-green-500">{stats.accepted}</p>
        </div>
        <div className="rounded-xl border border-dashed bg-card p-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">refusées</p>
          <p className="font-mono text-2xl font-bold text-red-400">{stats.rejected}</p>
        </div>
      </div>

      {/* Configuration */}
      <div className="space-y-4 rounded-xl border border-dashed bg-card p-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">— configuration —</p>
        <ChannelSelect
          botId={botId}
          label="salon_suggestions"
          value={String(cfg.channelId ?? "")}
          onChange={(v) => update("channelId", v)}
          filter="text"
        />
        <RoleSelect
          botId={botId}
          label="role_staff_validation"
          value={String(cfg.approveRoleId ?? "")}
          onChange={(v) => update("approveRoleId", v)}
        />
        <div className="flex justify-end">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            <Save className="size-3.5" />
            {saved ? "✓ saved" : saving ? "saving..." : "save_config"}
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mr-2">— suggestions —</p>
        {(["all", "pending", "accepted", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded border border-dashed px-2 py-1 font-mono text-[9px] uppercase tracking-widest transition ${
              filter === f ? "bg-blue-500/20 text-blue-400 border-blue-500/40" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "toutes" : f === "pending" ? "en attente" : f === "accepted" ? "acceptées" : "refusées"}
          </button>
        ))}
      </div>

      {/* Liste des suggestions */}
      <div className="space-y-3">
        {loading ? (
          <p className="font-mono text-[10px] text-muted-foreground/60">Chargement...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-8 text-center">
            <p className="font-mono text-[11px] text-muted-foreground/60">
              {filter === "all"
                ? "Aucune suggestion pour le moment. Les membres peuvent utiliser /suggest dans Discord."
                : `Aucune suggestion ${filter === "pending" ? "en attente" : filter === "accepted" ? "acceptée" : "refusée"}.`}
            </p>
          </div>
        ) : (
          filtered.map((s) => {
            const user = users[s.userId];
            const isResponding = respondingId === s.id;
            return (
              <div key={s.id} className="rounded-xl border border-dashed bg-card p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 size-2 shrink-0 rounded-full ${
                      s.status === "accepted"
                        ? "bg-green-500"
                        : s.status === "rejected"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-mono text-[11px] font-bold text-foreground" title={s.userId}>
                        {user?.displayName ?? s.userId}
                      </p>
                      <span className="font-mono text-[9px] text-muted-foreground/50">
                        · {new Date(s.createdAt).toLocaleString("fr-FR")}
                      </span>
                      <span
                        className={`ml-auto font-mono text-[9px] uppercase tracking-widest ${
                          s.status === "accepted"
                            ? "text-green-500"
                            : s.status === "rejected"
                            ? "text-red-400"
                            : "text-yellow-500"
                        }`}
                      >
                        {s.status === "pending" ? "en attente" : s.status === "accepted" ? "acceptée" : "refusée"}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-[11px] text-foreground/80 whitespace-pre-wrap">{s.content}</p>
                    <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
                      <span>👍 {s.upvotes.length}</span>
                      <span>👎 {s.downvotes.length}</span>
                    </div>
                    {s.response && (
                      <div className="mt-3 rounded-lg border border-dashed bg-background p-3">
                        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70 mb-1">
                          réponse du staff
                        </p>
                        <p className="font-mono text-[11px] text-foreground/80">{s.response}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {s.status === "pending" && !isResponding && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed">
                    <button
                      onClick={() => {
                        setRespondingId(s.id);
                        setResponseText("");
                      }}
                      className="rounded border border-dashed bg-background px-3 py-1.5 font-mono text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      Répondre avant action
                    </button>
                    <button
                      onClick={() => handleAction(s.id, "accepted")}
                      className="flex items-center gap-1.5 rounded border border-dashed bg-green-500/10 px-3 py-1.5 font-mono text-[10px] text-green-400 hover:bg-green-500/20"
                    >
                      <Check className="size-3" /> Accepter
                    </button>
                    <button
                      onClick={() => handleAction(s.id, "rejected")}
                      className="flex items-center gap-1.5 rounded border border-dashed bg-red-500/10 px-3 py-1.5 font-mono text-[10px] text-red-400 hover:bg-red-500/20"
                    >
                      <X className="size-3" /> Refuser
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="ml-auto rounded border border-dashed bg-background p-1.5 text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                )}

                {isResponding && (
                  <div className="space-y-2 pt-2 border-t border-dashed">
                    <CyberInput
                      label="réponse du staff (optionnel)"
                      value={responseText}
                      onChange={setResponseText}
                      placeholder="Ex: Bonne idée, on l'implémente cette semaine !"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(s.id, "accepted")}
                        className="flex items-center gap-1.5 rounded border border-dashed bg-green-500/10 px-3 py-1.5 font-mono text-[10px] text-green-400 hover:bg-green-500/20"
                      >
                        <Check className="size-3" /> Accepter avec ce message
                      </button>
                      <button
                        onClick={() => handleAction(s.id, "rejected")}
                        className="flex items-center gap-1.5 rounded border border-dashed bg-red-500/10 px-3 py-1.5 font-mono text-[10px] text-red-400 hover:bg-red-500/20"
                      >
                        <X className="size-3" /> Refuser avec ce message
                      </button>
                      <button
                        onClick={() => {
                          setRespondingId(null);
                          setResponseText("");
                        }}
                        className="ml-auto rounded border border-dashed bg-background px-3 py-1.5 font-mono text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {s.status !== "pending" && (
                  <div className="flex justify-end pt-2 border-t border-dashed">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="rounded border border-dashed bg-background p-1.5 text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="size-3" />
                    </button>
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
