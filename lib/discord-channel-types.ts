/**
 * Types de salons Discord, définis à un seul endroit.
 *
 * Les listes étaient recopiées à la main dans l'API, le sélecteur de salon et
 * l'éditeur de mentions, chacune avec ses oublis : les salons forum puis les
 * salons d'annonce disparaissaient tour à tour d'un écran ou d'un autre.
 */
export const CHANNEL_TYPE = {
  TEXT: 0,
  VOICE: 2,
  CATEGORY: 4,
  ANNOUNCEMENT: 5,
  FORUM: 15,
} as const;

/** Salons où le bot peut poster un message : texte ET annonces. */
export const MESSAGE_CHANNEL_TYPES: readonly number[] = [CHANNEL_TYPE.TEXT, CHANNEL_TYPE.ANNOUNCEMENT];

/** Salons qu'on peut citer avec <#id> dans un texte. */
export const MENTIONABLE_CHANNEL_TYPES: readonly number[] = [...MESSAGE_CHANNEL_TYPES, CHANNEL_TYPE.FORUM];

/** Tout ce que l'API renvoie au dashboard. */
export const DASHBOARD_CHANNEL_TYPES: readonly number[] = [
  ...MENTIONABLE_CHANNEL_TYPES,
  CHANNEL_TYPE.VOICE,
  CHANNEL_TYPE.CATEGORY,
];

export function channelIcon(type: number): string {
  if (type === CHANNEL_TYPE.VOICE) return "🔊 ";
  if (type === CHANNEL_TYPE.CATEGORY) return "📁 ";
  if (type === CHANNEL_TYPE.ANNOUNCEMENT) return "📢 ";
  if (type === CHANNEL_TYPE.FORUM) return "💬 ";
  return "# ";
}
