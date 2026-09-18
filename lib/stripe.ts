import Stripe from "stripe";

let client: Stripe | null = null;

/**
 * Client Stripe créé au premier appel, jamais au chargement du module.
 *
 * Pendant `next build`, Next importe chaque route pour collecter ses
 * métadonnées. Un `new Stripe(...)` au niveau du fichier s'exécutait alors
 * sans STRIPE_SECRET_KEY et faisait échouer le build Docker. Sur Vercel ça
 * passait uniquement parce que tous les secrets sont présents au build.
 */
export function getStripe(): Stripe {
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY!);
  return client;
}
