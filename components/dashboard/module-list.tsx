import { Activity, AlarmClock, Archive, BarChart2, Bug, Cake, ClipboardList, Clock, Coins, Gem, Gift, Lightbulb, Megaphone, MessageSquare, MessageSquareReply, Moon, MousePointerClick, Radio, Rocket, ScrollText, Shield, ShieldAlert, ShieldCheck, Sparkles, Star, Ticket, UserPlus, Users2, Volume2 } from "lucide-react";
import type { BotConfig } from "@/components/dashboard/bot-types";

export interface ModuleDef {
  key: keyof BotConfig;
  icon: React.ReactNode;
  label: string;
  description: string;
  path: string; // segment relatif, ex: "welcome" → /dashboard/bot/{id}/welcome
}

// Source unique pour la liste des modules — utilisée par la page Modules
// (toggles) et la page Activité (comptage/breakdown réel), pour éviter que
// les deux dérivent (comme l'ancien comptage codé en dur sur 3 modules).
export const FREE_MODULES: ModuleDef[] = [
  { key: "moduleWelcome", icon: <MessageSquare className="size-3.5" />, label: "welcome", description: "Messages de bienvenue, goodbye, auto-rôle, image dynamique", path: "welcome" },
  { key: "moduleModeration", icon: <Shield className="size-3.5" />, label: "moderation", description: "/ban /kick /warn /timeout /softban /massban + AutoMod", path: "moderation" },
  { key: "moduleLog", icon: <ScrollText className="size-3.5" />, label: "logs", description: "Logs centralisés et configurables de tous les événements", path: "logs" },
  { key: "moduleLevel", icon: <Star className="size-3.5" />, label: "xp & levels", description: "/rank /leaderboard · XP message + vocal · Rôles par niveau", path: "levels" },
  { key: "moduleReactionRoles", icon: <MousePointerClick className="size-3.5" />, label: "reaction roles", description: "Panels avec boutons pour auto-assigner des rôles", path: "reaction-roles" },
  { key: "moduleStatus", icon: <Radio className="size-3.5" />, label: "statut bot", description: "Présence Discord : Joue à, Regarde, Écoute — rotation automatique", path: "status" },
  { key: "moduleHoneypot", icon: <Bug className="size-3.5" />, label: "honeypot", description: "Salon-piège anti-spam : softban auto, MP de prévention, restauration des rôles", path: "honeypot" },
  { key: "moduleAnnounceCommand", icon: <Megaphone className="size-3.5" />, label: "annonce", description: "/annonce — publier une annonce (texte ou embed) dans un salon, réservé au staff", path: "announce" },
  { key: "moduleReminders", icon: <AlarmClock className="size-3.5" />, label: "rappels", description: "/remind add|list|delete — rappels personnels pour chaque membre", path: "reminders" },
  { key: "moduleBooster", icon: <Gem className="size-3.5" />, label: "booster", description: "Attribue automatiquement un rôle aux membres qui boostent le serveur", path: "booster" },
];

export const PRO_MODULES: ModuleDef[] = [
  { key: "moduleTickets", icon: <Ticket className="size-3.5" />, label: "tickets", description: "Système de tickets avancé avec transcripts HTML", path: "tickets" },
  { key: "moduleSurvey", icon: <BarChart2 className="size-3.5" />, label: "survey", description: "Sondages avancés (choix multiple, classé Borda, pondéré, récurrent)", path: "polls" },
  { key: "moduleMonitor", icon: <Activity className="size-3.5" />, label: "monitor", description: "Surveillance HTTP / TCP / PING / PostgreSQL / MySQL + SSH", path: "monitor" },
  { key: "moduleGiveaway", icon: <Gift className="size-3.5" />, label: "giveaway", description: "Concours avec conditions, modes de tirage et re-roll", path: "giveaway" },
  { key: "moduleVerification", icon: <ShieldCheck className="size-3.5" />, label: "vérification", description: "Panel de vérification avec CAPTCHA optionnel", path: "verification" },
  { key: "moduleTempchannels", icon: <Volume2 className="size-3.5" />, label: "temp channels", description: "Salons vocaux temporaires créés automatiquement", path: "tempchannels" },
  { key: "moduleStarboard", icon: <Star className="size-3.5" />, label: "starboard", description: "Reposte les messages les plus réactés dans un salon dédié", path: "starboard" },
  { key: "moduleAutoresponse", icon: <MessageSquareReply className="size-3.5" />, label: "auto-réponses", description: "Réponses automatiques selon des triggers configurables", path: "autoresponse" },
  { key: "moduleEconomy", icon: <Coins className="size-3.5" />, label: "economy", description: "/balance /daily /work /pay /slots /coinflip /rob", path: "economy" },
  { key: "moduleApplications", icon: <ClipboardList className="size-3.5" />, label: "candidatures", description: "Formulaires de candidature avec review staff", path: "applications" },
  { key: "moduleBirthday", icon: <Cake className="size-3.5" />, label: "anniversaires", description: "/birthday set/show/list — célébration automatique", path: "birthday" },
  { key: "moduleSuggestions", icon: <Lightbulb className="size-3.5" />, label: "suggestions", description: "/suggest — votes pour/contre, accepter/refuser", path: "suggestions" },
  { key: "moduleAfk", icon: <Moon className="size-3.5" />, label: "afk", description: "/afk — notification automatique si mentionné", path: "afk" },
  { key: "moduleScheduler", icon: <Clock className="size-3.5" />, label: "messages programmés", description: "/schedule add — daily / weekly / monthly / datetime", path: "scheduler" },
  { key: "moduleAibuild", icon: <Sparkles className="size-3.5" />, label: "ai build server", description: "/build-server — l'IA génère ton serveur complet (catégories, salons, rôles)", path: "aibuild" },
  { key: "moduleQuests", icon: <Rocket className="size-3.5" />, label: "quêtes", description: "/mission poster — salons bénévoles & contrats, nom de commande personnalisable", path: "quests" },
  { key: "moduleProfiles", icon: <ClipboardList className="size-3.5" />, label: "profils", description: "/profil creer|voir — registre de profils membres, nom de commande personnalisable", path: "profiles" },
  { key: "moduleTeams", icon: <Users2 className="size-3.5" />, label: "projets", description: "/projet poster|clore — recherche de coéquipiers, nom de commande personnalisable", path: "teams" },
  { key: "moduleInvites", icon: <UserPlus className="size-3.5" />, label: "invitations", description: "/invites voir|classement|ajouter|retirer|reset — tracker complet avec détection de faux comptes", path: "invites" },
  { key: "moduleAntinuke", icon: <ShieldAlert className="size-3.5" />, label: "anti-nuke", description: "Détecte et bloque un compte (même admin) qui supprime des salons/rôles ou bannit en masse", path: "antinuke" },
  { key: "moduleBackup", icon: <Archive className="size-3.5" />, label: "sauvegardes", description: "/backup create|list|restore|delete — snapshot de la structure du serveur (rôles, salons)", path: "backup" },
];

export const ALL_MODULES: ModuleDef[] = [...FREE_MODULES, ...PRO_MODULES];
