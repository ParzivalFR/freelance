"use client";

import { Activity, AlarmClock, Archive, BarChart2, Bug, Cake, Check, ClipboardList, Clock, Coins, Gem, Gift, Lightbulb, Loader2, Megaphone, MessageSquare, MessageSquareReply, Moon, MousePointerClick, Puzzle, Radio, Rocket, ScrollText, Shield, ShieldAlert, ShieldCheck, Sparkles, Star, Ticket, UserPlus, Users2, Volume2 } from "lucide-react";
import { ModuleToggle, PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useToast } from "@/components/ui/use-toast";
import type { BotConfig } from "@/components/dashboard/bot-types";

interface ModuleDef {
  key: keyof BotConfig;
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
}

export default function BotModulesPage() {
  const { config, saving, saved, updateAndSave } = useBotConfig();
  const { toast } = useToast();

  if (!config) return <LoadingScreen />;

  const base = `/dashboard/bot/${config.id}`;
  const isPro = config.plan === "PRO" || config.plan === "MANAGED";

  const toggle = async (key: keyof BotConfig) => {
    if (saving) return;
    const result = await updateAndSave(key, !config[key]);
    if (!result.ok) {
      toast({ title: "Erreur lors de la sauvegarde", description: result.error ?? "Une erreur est survenue.", variant: "destructive" });
    }
  };

  const freeModules: ModuleDef[] = [
    { key: "moduleWelcome", icon: <MessageSquare className="size-3.5" />, label: "welcome", description: "Messages de bienvenue, goodbye, auto-rôle, image dynamique", href: `${base}/welcome` },
    { key: "moduleModeration", icon: <Shield className="size-3.5" />, label: "moderation", description: "/ban /kick /warn /timeout /softban /massban + AutoMod", href: `${base}/moderation` },
    { key: "moduleLog", icon: <ScrollText className="size-3.5" />, label: "logs", description: "Logs centralisés et configurables de tous les événements", href: `${base}/logs` },
    { key: "moduleLevel", icon: <Star className="size-3.5" />, label: "xp & levels", description: "/rank /leaderboard · XP message + vocal · Rôles par niveau", href: `${base}/levels` },
    { key: "moduleReactionRoles", icon: <MousePointerClick className="size-3.5" />, label: "reaction roles", description: "Panels avec boutons pour auto-assigner des rôles", href: `${base}/reaction-roles` },
    { key: "moduleStatus", icon: <Radio className="size-3.5" />, label: "statut bot", description: "Présence Discord : Joue à, Regarde, Écoute — rotation automatique", href: `${base}/status` },
    { key: "moduleHoneypot", icon: <Bug className="size-3.5" />, label: "honeypot", description: "Salon-piège anti-spam : softban auto, MP de prévention, restauration des rôles", href: `${base}/honeypot` },
    { key: "moduleAnnounceCommand", icon: <Megaphone className="size-3.5" />, label: "annonce", description: "/annonce — publier une annonce (texte ou embed) dans un salon, réservé au staff", href: `${base}/announce` },
    { key: "moduleReminders", icon: <AlarmClock className="size-3.5" />, label: "rappels", description: "/remind add|list|delete — rappels personnels pour chaque membre", href: `${base}/reminders` },
    { key: "moduleBooster", icon: <Gem className="size-3.5" />, label: "booster", description: "Attribue automatiquement un rôle aux membres qui boostent le serveur", href: `${base}/booster` },
  ];

  const proModules: ModuleDef[] = [
    { key: "moduleTickets", icon: <Ticket className="size-3.5" />, label: "tickets", description: "Système de tickets avancé avec transcripts HTML", href: `${base}/tickets` },
    { key: "moduleSurvey", icon: <BarChart2 className="size-3.5" />, label: "survey", description: "Sondages avancés (choix multiple, classé Borda, pondéré, récurrent)", href: `${base}/polls` },
    { key: "moduleMonitor", icon: <Activity className="size-3.5" />, label: "monitor", description: "Surveillance HTTP / TCP / PING / PostgreSQL / MySQL + SSH", href: `${base}/monitor` },
    { key: "moduleGiveaway", icon: <Gift className="size-3.5" />, label: "giveaway", description: "Concours avec conditions, modes de tirage et re-roll", href: `${base}/giveaway` },
    { key: "moduleVerification", icon: <ShieldCheck className="size-3.5" />, label: "vérification", description: "Panel de vérification avec CAPTCHA optionnel", href: `${base}/verification` },
    { key: "moduleTempchannels", icon: <Volume2 className="size-3.5" />, label: "temp channels", description: "Salons vocaux temporaires créés automatiquement", href: `${base}/tempchannels` },
    { key: "moduleStarboard", icon: <Star className="size-3.5" />, label: "starboard", description: "Reposte les messages les plus réactés dans un salon dédié", href: `${base}/starboard` },
    { key: "moduleAutoresponse", icon: <MessageSquareReply className="size-3.5" />, label: "auto-réponses", description: "Réponses automatiques selon des triggers configurables", href: `${base}/autoresponse` },
    { key: "moduleEconomy", icon: <Coins className="size-3.5" />, label: "economy", description: "/balance /daily /work /pay /slots /coinflip /rob", href: `${base}/economy` },
    { key: "moduleApplications", icon: <ClipboardList className="size-3.5" />, label: "candidatures", description: "Formulaires de candidature avec review staff", href: `${base}/applications` },
    { key: "moduleBirthday", icon: <Cake className="size-3.5" />, label: "anniversaires", description: "/birthday set/show/list — célébration automatique", href: `${base}/birthday` },
    { key: "moduleSuggestions", icon: <Lightbulb className="size-3.5" />, label: "suggestions", description: "/suggest — votes pour/contre, accepter/refuser", href: `${base}/suggestions` },
    { key: "moduleAfk", icon: <Moon className="size-3.5" />, label: "afk", description: "/afk — notification automatique si mentionné", href: `${base}/afk` },
    { key: "moduleScheduler", icon: <Clock className="size-3.5" />, label: "messages programmés", description: "/schedule add — daily / weekly / monthly / datetime", href: `${base}/scheduler` },
    { key: "moduleAibuild", icon: <Sparkles className="size-3.5" />, label: "ai build server", description: "/build-server — l'IA génère ton serveur complet (catégories, salons, rôles)", href: `${base}/aibuild` },
    { key: "moduleQuests", icon: <Rocket className="size-3.5" />, label: "quêtes", description: "/mission poster — salons bénévoles & contrats, nom de commande personnalisable", href: `${base}/quests` },
    { key: "moduleProfiles", icon: <ClipboardList className="size-3.5" />, label: "profils", description: "/profil creer|voir — registre de profils membres, nom de commande personnalisable", href: `${base}/profiles` },
    { key: "moduleTeams", icon: <Users2 className="size-3.5" />, label: "projets", description: "/projet poster|clore — recherche de coéquipiers, nom de commande personnalisable", href: `${base}/teams` },
    { key: "moduleInvites", icon: <UserPlus className="size-3.5" />, label: "invitations", description: "/invites voir|classement|ajouter|retirer|reset — tracker complet avec détection de faux comptes", href: `${base}/invites` },
    { key: "moduleAntinuke", icon: <ShieldAlert className="size-3.5" />, label: "anti-nuke", description: "Détecte et bloque un compte (même admin) qui supprime des salons/rôles ou bannit en masse", href: `${base}/antinuke` },
    { key: "moduleBackup", icon: <Archive className="size-3.5" />, label: "sauvegardes", description: "/backup create|list|restore|delete — snapshot de la structure du serveur (rôles, salons)", href: `${base}/backup` },
  ];

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <PageHeader
          icon={<Puzzle className="size-4" />}
          title="Modules"
          subtitle="Active ou désactive les fonctionnalités de ton bot — sauvegarde automatique"
          status={config.status}
        />
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/60 shrink-0">
          {saving && <Loader2 className="size-3 animate-spin" />}
          {saved && !saving && <Check className="size-3 text-green-500" />}
          {saving ? "sauvegarde…" : saved ? "enregistré" : ""}
        </div>
      </div>

      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-green-500/70 pt-2">— modules gratuits —</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {freeModules.map((m) => (
            <ModuleToggle
              key={m.key}
              icon={m.icon}
              label={m.label}
              description={m.description}
              enabled={Boolean(config[m.key])}
              onToggle={() => toggle(m.key)}
              configHref={m.href}
            />
          ))}
        </div>

        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70 pt-4">— modules pro —</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {proModules.map((m) => (
            <ModuleToggle
              key={m.key}
              icon={m.icon}
              label={m.label}
              description={m.description}
              enabled={Boolean(config[m.key])}
              onToggle={() => toggle(m.key)}
              configHref={m.href}
              locked={!isPro}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
