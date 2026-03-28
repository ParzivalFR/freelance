"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Plus } from "lucide-react";
import { FaDiscord } from "react-icons/fa";

interface BotItem {
  id: string;
  name: string;
  status: string;
  plan: string | null;
  moduleWelcome: boolean;
  moduleModeration: boolean;
  moduleTickets: boolean;
  moduleLevel: boolean;
  moduleLog: boolean;
}

export default function BotsListPage() {
  const router = useRouter();
  const [bots, setBots] = useState<BotItem[] | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/bot/bots")
      .then((r) => r.json())
      .then((data) => setBots(Array.isArray(data) ? data : []));
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/bot/bots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (res.ok) {
        const newBot = await res.json();
        router.push(`/dashboard/bot/${newBot.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen space-y-6 px-5 py-8 md:px-8 lg:px-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <FaDiscord className="size-3" />
            dashboard
          </div>
          <h1 className="font-mono text-xl font-bold text-foreground">Mes bots</h1>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/60">
            {bots === null ? "Chargement..." : `${bots.length} bot${bots.length !== 1 ? "s" : ""} configuré${bots.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-blue-400 transition hover:bg-blue-500/20 disabled:opacity-50"
        >
          <Plus className="size-3.5" />
          {creating ? "Création..." : "Créer un bot"}
        </button>
      </div>

      {/* Loading */}
      {bots === null && (
        <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground/40">
          <div className="size-1.5 animate-pulse rounded-full bg-blue-500" />
          Chargement des bots...
        </div>
      )}

      {/* Empty state */}
      {bots !== null && bots.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-card py-20">
          <div className="flex size-14 items-center justify-center rounded-xl border border-dashed text-muted-foreground/30">
            <Bot className="size-7" />
          </div>
          <div className="text-center">
            <p className="font-mono text-sm font-bold text-foreground">Aucun bot configuré</p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground/50">
              Crée ton premier bot Discord pour commencer
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            <Plus className="size-3.5" />
            {creating ? "Création..." : "Créer mon premier bot"}
          </button>
        </div>
      )}

      {/* Bots grid */}
      {bots !== null && bots.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => {
            const activeModules = [bot.moduleWelcome, bot.moduleModeration, bot.moduleTickets, bot.moduleLevel, bot.moduleLog].filter(Boolean).length;
            const isOnline = bot.status === "ONLINE";
            return (
              <button
                key={bot.id}
                onClick={() => router.push(`/dashboard/bot/${bot.id}`)}
                className="group flex flex-col gap-3 rounded-xl border border-dashed bg-card p-5 text-left transition hover:border-blue-500/30 hover:bg-blue-500/5"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-dashed bg-muted text-muted-foreground/50 group-hover:border-blue-500/30 group-hover:text-blue-400 transition">
                    <FaDiscord className="size-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`size-1.5 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-muted-foreground/30"}`} />
                    <span className={`font-mono text-[9px] uppercase tracking-widest ${isOnline ? "text-green-500" : "text-muted-foreground/40"}`}>
                      {bot.status}
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <p className="font-mono text-sm font-bold text-foreground group-hover:text-blue-400 transition">
                    {bot.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/50">
                    {activeModules} module{activeModules !== 1 ? "s" : ""} actif{activeModules !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Plan */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">plan</span>
                  <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
                    bot.plan
                      ? "border border-green-500/30 bg-green-500/10 text-green-500"
                      : "border border-dashed text-muted-foreground/30"
                  }`}>
                    {bot.plan ?? "FREE"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
