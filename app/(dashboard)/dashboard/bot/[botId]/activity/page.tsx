"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Activity, Terminal } from "lucide-react";
import { PageHeader, StatCard, LoadingScreen } from "@/components/dashboard/cyber-ui";
import type { BotConfig } from "@/components/dashboard/bot-types";
import { useBotSocket, type BotLogEvent } from "@/hooks/use-bot-socket";

type LogEntry = {
  time: string;
  message: string;
  level?: "info" | "warn" | "error";
};

export default function BotActivityPage() {
  const params = useParams();
  const botId = params?.botId as string;

  const [config, setConfig] = useState<BotConfig | null>(null);
  const [infractionCount, setInfractionCount] = useState<number | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!botId) return;

    fetch(`/api/bot/config?botId=${botId}`)
      .then((r) => r.json())
      .then((data) => setConfig({ ...data, config: data.config ?? {} }));

    fetch(`/api/bot/infractions?botId=${botId}&limit=1`)
      .then((r) => r.json())
      .then((data) => setInfractionCount(data.total ?? 0));

    fetch(`/api/bot/logs?botId=${botId}`)
      .then((r) => r.json())
      .then((data: { logs: LogEntry[] }) => {
        if (Array.isArray(data.logs) && data.logs.length > 0) {
          setLogs(data.logs);
        }
      })
      .catch(() => {});
  }, [botId]);

  const handleLog = useCallback((event: BotLogEvent) => {
    const entry: LogEntry = {
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      message: event.message,
      level: event.level,
    };
    setLogs((prev) => {
      const next = [...prev, entry];
      return next.length > 100 ? next.slice(next.length - 100) : next;
    });
  }, []);

  const { connected } = useBotSocket({ botId: botId ?? "", onLog: handleLog });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!config) return <LoadingScreen />;

  const activeModules = [
    config.moduleWelcome,
    config.moduleModeration,
    config.moduleTickets,
  ].filter(Boolean).length;

  const modulesEnabled = [
    config.moduleWelcome && "Welcome",
    config.moduleModeration && "Modération",
    config.moduleTickets && "Tickets",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Activity className="size-4" />}
        title="Activité"
        subtitle="Statistiques et état du bot"
        status={config.status}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="statut_actuel"
          value={config.status}
          sub={config.status === "ONLINE" ? "En ligne et opérationnel" : "Hors ligne"}
          accent={config.status === "ONLINE"}
          pulse
        />
        <StatCard
          label="modules_actifs"
          value={`${activeModules} / 3`}
          sub={activeModules > 0 ? modulesEnabled.join(", ") : "Aucun module activé"}
          accent={activeModules > 0}
        />
        <StatCard
          label="infractions_totales"
          value={infractionCount !== null ? String(infractionCount) : "…"}
          sub="Sanctions enregistrées"
          accent={(infractionCount ?? 0) > 0}
        />
      </div>

      {/* Module status breakdown */}
      <div className="rounded-xl border border-dashed bg-card">
        <div className="border-b border-dashed px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            &gt; modules_status
          </span>
        </div>
        <div className="divide-y divide-dashed">
          {[
            { key: "moduleWelcome", label: "Welcome", desc: "Messages de bienvenue", enabled: config.moduleWelcome },
            { key: "moduleModeration", label: "Modération", desc: "/ban /kick /warn + AutoMod", enabled: config.moduleModeration },
            { key: "moduleTickets", label: "Tickets", desc: "Système de tickets avancé", enabled: config.moduleTickets },
          ].map(({ label, desc, enabled }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3">
              <div
                className={`size-2 shrink-0 rounded-full ${
                  enabled ? "bg-green-500" : "bg-muted-foreground/20"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs font-semibold text-foreground">{label}</p>
                <p className="font-mono text-[10px] text-muted-foreground/60">{desc}</p>
              </div>
              <span
                className={`font-mono text-[9px] uppercase tracking-widest ${
                  enabled ? "text-green-500" : "text-muted-foreground/30"
                }`}
              >
                {enabled ? "ACTIF" : "INACTIF"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal live */}
      <div className="rounded-xl border border-dashed bg-card">
        <div className="flex items-center gap-2 border-b border-dashed px-4 py-3">
          <Terminal className="size-3.5 text-muted-foreground/50" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            logs_live
          </span>
          <div className="ml-auto flex items-center gap-2">
            <div className={`size-1.5 rounded-full ${connected ? "animate-pulse bg-green-500" : "bg-muted-foreground/30"}`} />
            <span className="font-mono text-[9px] text-muted-foreground/50">{connected ? "connecté" : "hors ligne"}</span>
            <button onClick={() => setLogs([])} className="ml-2 font-mono text-[9px] text-muted-foreground/40 hover:text-muted-foreground">effacer</button>
          </div>
        </div>
        <div ref={scrollRef} className="h-64 overflow-y-auto p-4 space-y-0.5">
          {logs.length === 0 ? (
            <p className="font-mono text-[10px] text-muted-foreground/30">En attente de logs...</p>
          ) : (
            logs.map((log, i) => (
              <p key={i} className={`font-mono text-[10px] ${
                log.level === "error" ? "text-red-400" :
                log.level === "warn" ? "text-yellow-400" :
                "text-muted-foreground/60"
              }`}>
                <span className="text-muted-foreground/30">[{log.time}]</span> {log.message}
              </p>
            ))
          )}
        </div>
      </div>

      {/* Config snapshot */}
      <div className="rounded-xl border border-dashed bg-card p-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-3">
          config_snapshot
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {[
            { k: "bot_name", v: config.name },
            { k: "prefix", v: config.prefix },
            { k: "plan", v: config.plan ?? "FREE" },
            { k: "token", v: config.token ? "CONFIGURÉ" : "MANQUANT" },
          ].map(({ k, v }) => (
            <div key={k}>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50">{k}</p>
              <p className="font-mono text-[11px] text-foreground">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
