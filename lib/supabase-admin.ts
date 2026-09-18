import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Client Supabase à droits complets (service role), créé au premier appel.
 * Même raison que `getStripe` : instancié au chargement du module, il faisait
 * échouer `next build` dès que SUPABASE_URL n'était pas fourni au build.
 * Réservé aux routes serveur, la clé service role ne doit jamais partir côté
 * navigateur.
 */
export function getSupabaseAdmin(): SupabaseClient {
  client ??= createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  return client;
}
