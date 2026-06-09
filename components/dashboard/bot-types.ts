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
  goodbyeUseEmbed?: boolean;
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
  logsColorSurveys?: string;
  // Logs — giveaways
  logsChannelGiveaway?: string;
  logsColorGiveaway?: string;
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
  inactivityTimeout?: number;
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
  // Verification
  verificationChannelId?: string;
  verificationUnverifiedRoleId?: string;
  verificationVerifiedRoleId?: string;
  verificationEmbedTitle?: string;
  verificationEmbedDescription?: string;
  verificationEmbedColor?: string;
  verificationEmbedImage?: string;
  verificationCaptchaMode?: boolean;
  verificationLogChannelId?: string;
  // TempChannels
  tempChannelsTriggerChannelId?: string;
  tempChannelsCategoryId?: string;
  tempChannelsDefaultUserLimit?: number;
  tempChannelsChannelNameTemplate?: string;
  tempChannelsAllowRename?: boolean;
  tempChannelsAllowLimit?: boolean;
  tempChannelsAllowPrivate?: boolean;
  // Starboard
  starboardChannelId?: string;
  starboardEmoji?: string;
  starboardThreshold?: number;
  starboardSelfStar?: boolean;
  starboardIgnoreBots?: boolean;
  starboardIgnoreChannels?: string[];
  starboardEmbedColor?: string;
  starboardRemoveOnUnstar?: boolean;
  // Reaction Roles
  reactionRoles?: RRPanel[];
  // Economy
  currencyName?: string;
  currencyEmoji?: string;
  dailyAmount?: number;
  weeklyAmount?: number;
  workCooldownHours?: number;
  workMin?: number;
  workMax?: number;
  startingBalance?: number;
  allowGambling?: boolean;
  maxBet?: number;
  // Birthday
  birthday?: {
    channelId?: string;
    roleId?: string;
    message?: string;
    removeRoleAfterHours?: number;
  };
  // Suggestions
  suggestions?: {
    channelId?: string;
    approveRoleId?: string;
  };
  // Général
  guildId?: string;
}

export interface RRButton {
  roleId: string;
  label: string;
  emoji?: string;
  style?: "primary" | "secondary" | "success" | "danger";
}

export interface RRPanel {
  id: string;
  channelId: string;
  messageId?: string;
  title: string;
  description?: string;
  color?: string;
  mode: "toggle" | "unique" | "verify";
  buttons: RRButton[];
}

export interface BotConfig {
  id: string;
  name: string;
  token: string | null;
  hasToken: boolean;
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
  moduleVerification: boolean;
  moduleTempchannels: boolean;
  moduleStarboard: boolean;
  moduleReactionRoles: boolean;
  moduleAutoresponse: boolean;
  moduleEconomy: boolean;
  moduleApplications: boolean;
  moduleBirthday: boolean;
  moduleSuggestions: boolean;
  moduleAfk: boolean;
  moduleScheduler: boolean;
  moduleAibuild: boolean;
  config: ModuleConfig;
  workerCommand: string | null;
}

export interface AutoResponse {
  id: string;
  botId: string;
  guildId: string;
  trigger: string;
  triggerType: "exact" | "contains" | "startswith" | "endswith" | "regex";
  response: string;
  responseType: "text" | "embed" | "reaction";
  embedColor?: string | null;
  embedTitle?: string | null;
  caseSensitive: boolean;
  cooldownSeconds: number;
  allowedChannelIds: string[];
  ignoredRoleIds: string[];
  deleteOriginal: boolean;
  replyToUser: boolean;
  triggerCount: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
