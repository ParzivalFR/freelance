"use client";

import { Activity, BarChart2, Gift, MessageSquare, Puzzle, Save, ScrollText, Shield, Star, Ticket } from "lucide-react";
import { ModuleToggle, PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";

export default function BotModulesPage() {
  const { config, saving, saved, update, save } = useBotConfig();

  if (!config) return <LoadingScreen />;

  const base = `/dashboard/bot/${config.id}`;
  const isPro = !!config.plan;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Puzzle className="size-4" />}
        title="Modules"
        subtitle="Active ou désactive les fonctionnalités de ton bot"
        status={config.status}
      />

      <div className="space-y-3">

        <ModuleToggle
          icon={<Activity className="size-3.5" />}
          label="monitor"
          description="Surveillance de disponibilité (HTTP / TCP / PING)"
          enabled={config.moduleMonitor}
          onToggle={() => update("moduleMonitor", !config.moduleMonitor)}
          configHref={`${base}/monitor`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<MessageSquare className="size-3.5" />}
          label="welcome"
          description="Messages de bienvenue personnalisés"
          enabled={config.moduleWelcome}
          onToggle={() => update("moduleWelcome", !config.moduleWelcome)}
          configHref={`${base}/welcome`}
        />

        <ModuleToggle
          icon={<Shield className="size-3.5" />}
          label="moderation"
          description="/ban /kick /warn /timeout + AutoMod"
          enabled={config.moduleModeration}
          onToggle={() => update("moduleModeration", !config.moduleModeration)}
          configHref={`${base}/moderation`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<Ticket className="size-3.5" />}
          label="tickets"
          description="Système de tickets avancé"
          enabled={config.moduleTickets}
          onToggle={() => update("moduleTickets", !config.moduleTickets)}
          configHref={`${base}/tickets`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<Star className="size-3.5" />}
          label="xp & levels"
          description="/rank /leaderboard · Rôles par niveau"
          enabled={config.moduleLevel}
          onToggle={() => update("moduleLevel", !config.moduleLevel)}
          configHref={`${base}/levels`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<ScrollText className="size-3.5" />}
          label="logs"
          description="Logs centralisés et configurables de tous les événements"
          enabled={config.moduleLog}
          onToggle={() => update("moduleLog", !config.moduleLog)}
          configHref={`${base}/logs`}
        />

        <ModuleToggle
          icon={<BarChart2 className="size-3.5" />}
          label="survey"
          description="Sondages avancés (choix multiple, classé, pondéré)"
          enabled={config.moduleSurvey}
          onToggle={() => update("moduleSurvey", !config.moduleSurvey)}
          configHref={`${base}/polls`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<Gift className="size-3.5" />}
          label="giveaway"
          description="Concours avec conditions d'entrée, modes de tirage et re-roll"
          enabled={config.moduleGiveaway}
          onToggle={() => update("moduleGiveaway", !config.moduleGiveaway)}
          configHref={`${base}/giveaway`}
          locked={!isPro}
        />

      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg border border-dashed px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Save className="size-3.5" />
          {saved ? "✓ saved" : saving ? "saving..." : "save_config"}
        </button>
      </div>
    </div>
  );
}
