"use client";

import { Activity, BarChart2, Cake, ClipboardList, Clock, Coins, Gift, Lightbulb, MessageSquare, MessageSquareReply, Moon, MousePointerClick, Puzzle, Save, ScrollText, Shield, ShieldCheck, Sparkles, Star, Ticket, Volume2 } from "lucide-react";
import { ModuleToggle, PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useToast } from "@/components/ui/use-toast";

export default function BotModulesPage() {
  const { config, saving, saved, update, save } = useBotConfig();
  const { toast } = useToast();

  if (!config) return <LoadingScreen />;

  const base = `/dashboard/bot/${config.id}`;
  const isPro = config.plan === "PRO" || config.plan === "MANAGED";

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Puzzle className="size-4" />}
        title="Modules"
        subtitle="Active ou désactive les fonctionnalités de ton bot"
        status={config.status}
      />

      <div className="space-y-3">

        {/* ─── FREE ─── */}
        <p className="font-mono text-[9px] uppercase tracking-widest text-green-500/70 pt-2">— modules gratuits —</p>

        <ModuleToggle
          icon={<MessageSquare className="size-3.5" />}
          label="welcome"
          description="Messages de bienvenue, goodbye, auto-rôle, image dynamique"
          enabled={config.moduleWelcome}
          onToggle={() => update("moduleWelcome", !config.moduleWelcome)}
          configHref={`${base}/welcome`}
        />

        <ModuleToggle
          icon={<Shield className="size-3.5" />}
          label="moderation"
          description="/ban /kick /warn /timeout /softban /massban + AutoMod"
          enabled={config.moduleModeration}
          onToggle={() => update("moduleModeration", !config.moduleModeration)}
          configHref={`${base}/moderation`}
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
          icon={<Star className="size-3.5" />}
          label="xp & levels"
          description="/rank /leaderboard · XP message + vocal · Rôles par niveau"
          enabled={config.moduleLevel}
          onToggle={() => update("moduleLevel", !config.moduleLevel)}
          configHref={`${base}/levels`}
        />

        <ModuleToggle
          icon={<MousePointerClick className="size-3.5" />}
          label="reaction roles"
          description="Panels avec boutons pour auto-assigner des rôles"
          enabled={config.moduleReactionRoles}
          onToggle={() => update("moduleReactionRoles", !config.moduleReactionRoles)}
          configHref={`${base}/reaction-roles`}
        />

        {/* ─── PRO ─── */}
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70 pt-4">— modules pro —</p>

        <ModuleToggle
          icon={<Ticket className="size-3.5" />}
          label="tickets"
          description="Système de tickets avancé avec transcripts HTML"
          enabled={config.moduleTickets}
          onToggle={() => update("moduleTickets", !config.moduleTickets)}
          configHref={`${base}/tickets`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<BarChart2 className="size-3.5" />}
          label="survey"
          description="Sondages avancés (choix multiple, classé Borda, pondéré, récurrent)"
          enabled={config.moduleSurvey}
          onToggle={() => update("moduleSurvey", !config.moduleSurvey)}
          configHref={`${base}/polls`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<Activity className="size-3.5" />}
          label="monitor"
          description="Surveillance HTTP / TCP / PING / PostgreSQL / MySQL + SSH"
          enabled={config.moduleMonitor}
          onToggle={() => update("moduleMonitor", !config.moduleMonitor)}
          configHref={`${base}/monitor`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<Gift className="size-3.5" />}
          label="giveaway"
          description="Concours avec conditions, modes de tirage et re-roll"
          enabled={config.moduleGiveaway}
          onToggle={() => update("moduleGiveaway", !config.moduleGiveaway)}
          configHref={`${base}/giveaway`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<ShieldCheck className="size-3.5" />}
          label="vérification"
          description="Panel de vérification avec CAPTCHA optionnel"
          enabled={config.moduleVerification}
          onToggle={() => update("moduleVerification", !config.moduleVerification)}
          configHref={`${base}/verification`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<Volume2 className="size-3.5" />}
          label="temp channels"
          description="Salons vocaux temporaires créés automatiquement"
          enabled={config.moduleTempchannels}
          onToggle={() => update("moduleTempchannels", !config.moduleTempchannels)}
          configHref={`${base}/tempchannels`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<Star className="size-3.5" />}
          label="starboard"
          description="Reposte les messages les plus réactés dans un salon dédié"
          enabled={config.moduleStarboard}
          onToggle={() => update("moduleStarboard", !config.moduleStarboard)}
          configHref={`${base}/starboard`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<MessageSquareReply className="size-3.5" />}
          label="auto-réponses"
          description="Réponses automatiques selon des triggers configurables"
          enabled={config.moduleAutoresponse}
          onToggle={() => update("moduleAutoresponse", !config.moduleAutoresponse)}
          configHref={`${base}/autoresponse`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<Coins className="size-3.5" />}
          label="economy"
          description="/balance /daily /work /pay /slots /coinflip /rob"
          enabled={config.moduleEconomy}
          onToggle={() => update("moduleEconomy", !config.moduleEconomy)}
          configHref={`${base}/economy`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<ClipboardList className="size-3.5" />}
          label="candidatures"
          description="Formulaires de candidature avec review staff"
          enabled={config.moduleApplications}
          onToggle={() => update("moduleApplications", !config.moduleApplications)}
          configHref={`${base}/applications`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<Cake className="size-3.5" />}
          label="anniversaires"
          description="/birthday set/show/list — célébration automatique"
          enabled={config.moduleBirthday}
          onToggle={() => update("moduleBirthday", !config.moduleBirthday)}
          configHref={`${base}/birthday`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<Lightbulb className="size-3.5" />}
          label="suggestions"
          description="/suggest — votes pour/contre, accepter/refuser"
          enabled={config.moduleSuggestions}
          onToggle={() => update("moduleSuggestions", !config.moduleSuggestions)}
          configHref={`${base}/suggestions`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<Moon className="size-3.5" />}
          label="afk"
          description="/afk — notification automatique si mentionné"
          enabled={config.moduleAfk}
          onToggle={() => update("moduleAfk", !config.moduleAfk)}
          configHref={`${base}/afk`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<Clock className="size-3.5" />}
          label="messages programmés"
          description="/schedule add — daily / weekly / monthly / datetime"
          enabled={config.moduleScheduler}
          onToggle={() => update("moduleScheduler", !config.moduleScheduler)}
          configHref={`${base}/scheduler`}
          locked={!isPro}
        />

        <ModuleToggle
          icon={<Sparkles className="size-3.5" />}
          label="ai build server"
          description="/build-server — l'IA génère ton serveur complet (catégories, salons, rôles)"
          enabled={config.moduleAibuild}
          onToggle={() => update("moduleAibuild", !config.moduleAibuild)}
          configHref={`${base}/aibuild`}
          locked={!isPro}
        />

      </div>

      <div className="flex justify-end">
        <button
          onClick={async () => {
            const result = await save();
            if (!result.ok) {
              toast({
                title: "Erreur lors de la sauvegarde",
                description: result.error ?? "Une erreur est survenue.",
                variant: "destructive",
              });
            }
          }}
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
