export interface LevelReward {
  level: number;
  roleId: string;
}

export interface TicketCategory {
  id: string;
  label: string;
  emoji: string;
  description?: string;
}

export interface WarnThresholdEntry {
  count: number;
  action: "timeout" | "kick" | "ban";
  duration?: number;
  reason?: string;
}

export interface ModuleConfig {
  // Welcome
  channelId?: string;
  useEmbed?: boolean;
  message?: string;
  embedTitle?: string;
  embedDescription?: string;
  embedColor?: string;
  embedThumbnail?: boolean;
  embedFooter?: string;
  embedImage?: string;
  goodbyeEnabled?: boolean;
  goodbyeChannelId?: string;
  goodbyeMessage?: string;
  autoRoleIds?: string[];
  // Moderation
  logChannelId?: string;
  // Seuils warn
  warnThresholdTimeout?: number;
  warnThresholdTimeoutDuration?: number;
  warnThresholdKick?: number;
  warnThresholdBan?: number;
  // AutoMod
  automodEnabled?: boolean;
  automodAntiSpam?: boolean;
  automodAntiDuplicate?: boolean;
  automodBadWords?: string;
  automodAntiLinks?: boolean;
  automodAllowedDomains?: string;
  automodAntiMentionSpam?: boolean;
  automodAntiCaps?: boolean;
  automodAction?: string;
  automodActionDuration?: number;
  spamMaxMessages?: number;
  spamWindowSeconds?: number;
  duplicateMinLength?: number;
  warnThresholdsList?: WarnThresholdEntry[];
  // Levels
  xpPerMessage?: number;
  xpCooldown?: number;
  xpMultiplier?: number;
  xpPerMinuteVoice?: number;
  levelAnnounceChannel?: string;
  levelAnnounceMessage?: string;
  levelStackRoles?: boolean;
  levelNoXpRoles?: string;      // virgule-séparés
  levelNoXpChannels?: string;   // virgule-séparés
  levelRewards?: LevelReward[];
  channelMultipliers?: Record<string, number>;
  roleMultipliers?: Record<string, number>;
  // Logs — salons
  logsChannelId?: string;
  logsChannelMembers?: string;
  logsChannelModeration?: string;
  logsChannelTickets?: string;
  logsChannelLevels?: string;
  // Logs — filtrage
  logsDisabledEvents?: string[];
  // Logs — mentions
  logsMentionRoleId?: string;
  logsMentionOnEvents?: string[];
  // Logs — couleurs
  logsColorMembers?: string;
  logsColorModeration?: string;
  logsColorTickets?: string;
  logsColorLevels?: string;
  logsColorDiscord?: string;
  // Logs — salon discord natif
  logsChannelDiscord?: string;
  // Logs — salon sondages
  logsChannelSurveys?: string;
  // Welcome — image dynamique
  useWelcomeImage?: boolean;
  welcomeImageBackground?: string;
  // Welcome — anti-raid
  antiRaidEnabled?: boolean;
  antiRaidMinAccountAgeDays?: number;
  antiRaidAction?: "kick" | "ban" | "mute";
  antiRaidJoinRateLimit?: number;
  // Tickets
  categoryId?: string;
  staffRoleId?: string;
  panelTitle?: string;
  panelDescription?: string;
  panelColor?: string;
  panelImage?: string;
  categories?: TicketCategory[];
  enableRating?: boolean;
  enableClaim?: boolean;
  openMessage?: string;
  // Survey (paramètres globaux du module)
  pollChannelId?: string;     // salon par défaut pour les sondages
  pollManagerRoleId?: string; // rôle autorisé à créer des sondages (vide = @everyone)
  pollColor?: string;
  // Monitor
  monitorAlertChannelId?: string;
  monitorAlertRoleId?: string;
  // Giveaway
  giveawayGuildId?: string;
  giveawayDefaultChannelId?: string;
  giveawayManagerRoleId?: string;
  giveawayDmWinners?: boolean;
  // Monitor — Status Board
  statusBoardEnabled?: boolean;
  statusBoardChannelId?: string;
  statusBoardMessageId?: string;
  statusBoardTitle?: string;
  statusBoardUseEmbed?: boolean;
  statusBoardShowResponseTime?: boolean;
  statusBoardEmojiUp?: string;
  statusBoardEmojiDown?: string;
  statusBoardEmojiPending?: string;
  // Général
  guildId?: string;
}

export interface BotConfig {
  id: string;
  name: string;
  token: string | null;
  prefix: string;
  status: string;
  plan: string | null;
  paidAt: string | null;
  planEndsAt: string | null;
  stripeSubscriptionId: string | null;
  moduleWelcome: boolean;
  moduleModeration: boolean;
  moduleTickets: boolean;
  moduleLevel: boolean;
  moduleLog: boolean;
  moduleSurvey: boolean;
  moduleMonitor: boolean;
  moduleGiveaway: boolean;
  config: ModuleConfig;
  workerCommand: string | null;
}
