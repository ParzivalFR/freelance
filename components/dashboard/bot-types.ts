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
  // Levels
  xpPerMessage?: number;
  xpCooldown?: number;
  xpMultiplier?: number;
  levelAnnounceChannel?: string;
  levelAnnounceMessage?: string;
  levelStackRoles?: boolean;
  levelNoXpRoles?: string;      // virgule-séparés
  levelNoXpChannels?: string;   // virgule-séparés
  levelRewards?: LevelReward[];
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
}

export interface BotConfig {
  id: string;
  name: string;
  token: string | null;
  prefix: string;
  status: string;
  plan: string | null;
  paidAt: string | null;
  moduleWelcome: boolean;
  moduleModeration: boolean;
  moduleTickets: boolean;
  moduleLevel: boolean;
  moduleLog: boolean;
  config: ModuleConfig;
  workerCommand: string | null;
}
