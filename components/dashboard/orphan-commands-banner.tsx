"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

/**
 * Alerte sur les commandes globales héritées d'un bot précédent.
 *
 * Une application Discord réutilisée conserve les commandes globales de son
 * ancien occupant. Le moteur ne les connaît pas et ne peut pas y répondre : le
 * client les voit dans la liste, les utilise, et Discord affiche « l'application
 * n'a pas répondu ». Elles ne sont supprimables que par l'API, il n'existe pas
 * d'écran pour ça côté Discord.
 *
 * Rien ne s'affiche quand il n'y en a pas, ce qui est le cas le plus courant.
 */
export function OrphanCommandsBanner({ botId }: { botId: string }) {
  const { toast } = useToast();
  const [commands, setCommands] = useState<string[] | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/bot/${botId}/global-commands`);
      if (!response.ok) return; // Token absent ou Discord injoignable : on se tait.
      const data = (await response.json()) as { commands: string[] };
      setCommands(data.commands);
    } catch {
      // Un bandeau d'information ne doit jamais casser la page.
    }
  }, [botId]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove() {
    setDeleting(true);
    try {
      const response = await fetch(`/api/bot/${botId}/global-commands`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      setCommands([]);
      toast({
        title: "Commandes supprimées",
        description:
          "Elles disparaîtront de Discord d'ici quelques minutes. Les commandes de votre bot ne sont pas touchées.",
      });
    } catch {
      toast({
        title: "Suppression impossible",
        description: "Discord a refusé l'opération. Réessayez dans un instant.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (!commands || commands.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] uppercase tracking-widest text-amber-600 dark:text-amber-500">
            commandes_orphelines
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {commands.length} commande{commands.length > 1 ? "s" : ""} ne
            répond{commands.length > 1 ? "ent" : ""} plus
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Votre application Discord a hébergé un autre bot avant celui-ci, et
            il a laissé ces commandes derrière lui. Elles apparaissent encore
            dans Discord mais plus rien ne les exécute : les utiliser affiche
            « l&apos;application n&apos;a pas répondu ».
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {commands.map((name) => (
              <span
                key={name}
                className="rounded border border-amber-500/30 bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
              >
                /{name}
              </span>
            ))}
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            Les commandes de votre bot sont enregistrées séparément et ne sont
            pas concernées.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {confirming ? (
              <>
                <button
                  type="button"
                  onClick={remove}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-mono text-xs font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
                >
                  {deleting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  Oui, supprimer les {commands.length}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={deleting}
                  className="rounded-lg px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Annuler
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 px-4 py-2 font-mono text-xs font-semibold text-amber-600 transition-colors hover:bg-amber-500/10 dark:text-amber-500"
              >
                <Trash2 className="size-3.5" />
                Supprimer ces commandes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
