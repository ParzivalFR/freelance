"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, BotIcon, CloudIcon, Download, Power, Rocket, RotateCw, ServerIcon, Square, XCircle } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function BotDeployPage() {
  const { config, setConfig } = useBotConfig();
  const { toast } = useToast();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [checkingOut, setCheckingOut] = useState<"ZIP" | "PRO" | null>(null);
  const [workerLoading, setWorkerLoading] = useState<"START" | "STOP" | "RESTART" | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const pollStatus = useCallback(
    async (botId: string, expected: "ONLINE" | "OFFLINE", timeoutMs = 60_000) => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        await new Promise((r) => setTimeout(r, 3_000));
        const res = await fetch(`/api/bot/config?botId=${botId}`);
        if (!res.ok) continue;
        const data = await res.json();
        setConfig(data);
        if (data.status === expected) return "ok";
        if (data.status === "ERROR") return "error";
      }
      return "timeout";
    },
    [setConfig]
  );

  const sendWorkerCommand = useCallback(
    async (cmd: "START" | "STOP" | "RESTART") => {
      if (!config) return;
      setWorkerLoading(cmd);
      try {
        const res = await fetch("/api/bot/config", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: config.id, workerCommand: cmd }),
        });
        if (!res.ok) {
          toast({ title: "Erreur", description: "Impossible d'envoyer la commande.", variant: "destructive" });
          return;
        }

        if (cmd === "START" || cmd === "RESTART") {
          const result = await pollStatus(config.id, "ONLINE");
          if (result === "ok") {
            toast({ title: "Bot démarré ✅", description: "Ton bot est en ligne." });
          } else if (result === "error") {
            toast({ title: "Erreur au démarrage ❌", description: "Le bot a rencontré une erreur.", variant: "destructive" });
          } else {
            toast({ title: "Délai dépassé ⏱️", description: "Le bot met trop de temps à démarrer.", variant: "destructive" });
          }
        } else if (cmd === "STOP") {
          const result = await pollStatus(config.id, "OFFLINE", 30_000);
          if (result === "ok") {
            toast({ title: "Bot arrêté", description: "Ton bot est hors ligne." });
          } else {
            toast({ title: "Arrêt lent", description: "Le bot ne répond pas, vérifie les logs.", variant: "destructive" });
          }
        }
      } finally {
        setWorkerLoading(null);
      }
    },
    [config, pollStatus, toast]
  );

  const handleCheckout = useCallback(
    async (plan: "ZIP" | "PRO") => {
      if (!config) return;
      setCheckingOut(plan);
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, botId: config.id }),
        });
        const { url } = await res.json();
        if (url) window.location.href = url;
      } finally {
        setCheckingOut(null);
      }
    },
    [config]
  );

  const handleCancelSubscription = useCallback(async () => {
    if (!config) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bot/${config.id}/cancel-subscription`, { method: "POST" });
      if (res.ok) {
        const { planEndsAt } = await res.json();
        setConfig((prev) => prev ? { ...prev, planEndsAt } : prev);
      }
    } finally {
      setCancelling(false);
      setShowCancelDialog(false);
    }
  }, [config, setConfig]);

  if (!config) return <LoadingScreen />;

  const isCancelPending = !!config.planEndsAt;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Rocket className="size-4" />}
        title="Déploiement"
        subtitle="Choisir et gérer ton plan"
        status={config.status}
      />

      {/* Plan FREE (aucun plan payant) */}
      {!config.plan && (
        <div className="space-y-4">
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/15">
                <BotIcon className="size-5 text-green-400" />
              </div>
              <div>
                <p className="font-mono text-xs font-bold text-green-500">Plan Free — actif</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Ton bot est hébergé gratuitement avec les modules de base.
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["1 bot hébergé", "Module Welcome", "Module Logs", "Démarrage en 1 clic"].map((f) => (
                <p key={f} className="font-mono text-[10px] text-muted-foreground">✓ {f}</p>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-dashed bg-card p-4">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              prérequis avant de déployer
            </p>
            <div className="mt-3 space-y-2">
              {[
                { ok: !!config.token, label: "Token Discord configuré" },
                { ok: config.moduleWelcome || config.moduleModeration || config.moduleTickets, label: "Au moins un module activé" },
                { ok: !!config.name, label: "Nom du bot défini" },
              ].map(({ ok, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`size-1.5 rounded-full ${ok ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                  <span className={`font-mono text-[11px] ${ok ? "text-foreground" : "text-muted-foreground/50"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-dashed bg-card p-4">
            <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              contrôle_du_processus
            </p>
            <div className="flex gap-2">
              {config.status === "OFFLINE" || config.status === "ERROR" ? (
                <button
                  onClick={() => sendWorkerCommand("START")}
                  disabled={!!workerLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600/20 px-3 py-2.5 font-mono text-[11px] font-bold text-green-400 transition hover:bg-green-600/30 disabled:opacity-50"
                >
                  <Power className="size-3.5" />
                  {workerLoading === "START" ? "démarrage..." : "Démarrer"}
                </button>
              ) : (
                <button
                  onClick={() => sendWorkerCommand("STOP")}
                  disabled={!!workerLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600/20 px-3 py-2.5 font-mono text-[11px] font-bold text-red-400 transition hover:bg-red-600/30 disabled:opacity-50"
                >
                  <Square className="size-3.5" />
                  {workerLoading === "STOP" ? "arrêt..." : "Arrêter"}
                </button>
              )}
              <button
                onClick={() => sendWorkerCommand("RESTART")}
                disabled={!!workerLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600/20 px-3 py-2.5 font-mono text-[11px] font-bold text-blue-400 transition hover:bg-blue-600/30 disabled:opacity-50"
              >
                <RotateCw className={`size-3.5 ${workerLoading === "RESTART" ? "animate-spin" : ""}`} />
                {workerLoading === "RESTART" ? "redémarrage..." : "Redémarrer"}
              </button>
            </div>
            <p className="mt-2 font-mono text-[9px] text-muted-foreground/40">
              La commande est transmise au worker — prise en compte sous ~15s
            </p>
          </div>

          <button
            onClick={() => setShowPlanModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/5 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-blue-400 transition hover:bg-blue-500/10"
          >
            <Rocket className="size-4" />
            passer pro / obtenir les sources ▶
          </button>
        </div>
      )}

      {/* Plan ZIP */}
      {config.plan === "ZIP" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-green-500">
              ✓ plan livraison .zip actif
            </p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              Ton bot configuré est prêt à être téléchargé. Lance-le toi-même sur ton serveur.
            </p>
          </div>
          <a
            href="/api/bot/download"
            download
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-blue-400 transition hover:bg-blue-500/20"
          >
            <Download className="size-4" />
            télécharger mon bot .zip
          </a>
          <p className="text-center font-mono text-[9px] text-muted-foreground/40">
            Inclus : code source + config pré-remplie + .env.example + README détaillé
          </p>
        </div>
      )}

      {/* Plan PRO */}
      {config.plan === "PRO" && (
        <div className="space-y-3">

          {/* Annulation en cours */}
          {isCancelPending && (
            <div className="flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-yellow-500" />
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-yellow-500">
                  Abonnement annulé
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  Ton bot reste actif jusqu&apos;au{" "}
                  <span className="font-bold text-foreground">
                    {format(new Date(config.planEndsAt!), "dd MMMM yyyy", { locale: fr })}
                  </span>
                  , puis sera automatiquement arrêté.
                </p>
              </div>
            </div>
          )}

          {/* Statut actif */}
          {!isCancelPending && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/15">
                  <CloudIcon className="size-5 text-green-400" />
                </div>
                <div>
                  <p className="font-mono text-xs font-bold text-green-500">Plan Pro — actif 24/7</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Ton bot est hébergé et géré par nos soins. Aucune intervention requise.
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {["Uptime 24/7 garanti", "Mises à jour automatiques", "Support prioritaire", "Tous les modules"].map((f) => (
                  <p key={f} className="font-mono text-[10px] text-muted-foreground">✓ {f}</p>
                ))}
              </div>
            </div>
          )}

          {/* Contrôles du processus */}
          <div className="rounded-xl border border-dashed bg-card p-4">
            <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              contrôle_du_processus
            </p>
            <div className="flex gap-2">
              {config.status === "OFFLINE" || config.status === "ERROR" ? (
                <button
                  onClick={() => sendWorkerCommand("START")}
                  disabled={!!workerLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600/20 px-3 py-2.5 font-mono text-[11px] font-bold text-green-400 transition hover:bg-green-600/30 disabled:opacity-50"
                >
                  <Power className="size-3.5" />
                  {workerLoading === "START" ? "démarrage..." : "Démarrer"}
                </button>
              ) : (
                <button
                  onClick={() => sendWorkerCommand("STOP")}
                  disabled={!!workerLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600/20 px-3 py-2.5 font-mono text-[11px] font-bold text-red-400 transition hover:bg-red-600/30 disabled:opacity-50"
                >
                  <Square className="size-3.5" />
                  {workerLoading === "STOP" ? "arrêt..." : "Arrêter"}
                </button>
              )}
              <button
                onClick={() => sendWorkerCommand("RESTART")}
                disabled={!!workerLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600/20 px-3 py-2.5 font-mono text-[11px] font-bold text-blue-400 transition hover:bg-blue-600/30 disabled:opacity-50"
              >
                <RotateCw className={`size-3.5 ${workerLoading === "RESTART" ? "animate-spin" : ""}`} />
                {workerLoading === "RESTART" ? "redémarrage..." : "Redémarrer"}
              </button>
            </div>
            <p className="mt-2 font-mono text-[9px] text-muted-foreground/40">
              La commande est transmise au worker — prise en compte sous ~15s
            </p>
          </div>

          {/* Annuler l'abonnement */}
          {!isCancelPending && (
            <button
              onClick={() => setShowCancelDialog(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-red-500/20 px-4 py-3 font-mono text-[11px] text-red-400/60 transition hover:border-red-500/40 hover:text-red-400"
            >
              <XCircle className="size-3.5" />
              annuler_abonnement
            </button>
          )}
        </div>
      )}

      {/* Invite Discord */}
      <div className="rounded-xl border border-dashed bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <FaDiscord className="size-3.5 text-muted-foreground/50" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            invite_du_bot
          </span>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground/70">
          Pour inviter ton bot sur un serveur Discord, génère un lien d&apos;invitation depuis le{" "}
          <span className="text-blue-400">Portal Développeur Discord</span> avec les permissions nécessaires.
        </p>
      </div>

      {/* Modal choix de plan */}
      <AnimatePresence>
        {showPlanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
            onClick={() => setShowPlanModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-mono text-sm font-bold text-foreground">Passer à la vitesse supérieure</h2>
                  <p className="font-mono text-[10px] text-muted-foreground">Choisis le plan qui correspond à tes besoins</p>
                </div>
                <button onClick={() => setShowPlanModal(false)} className="text-muted-foreground/50 hover:text-foreground transition-colors">✕</button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Plan Pro */}
                <button
                  onClick={() => handleCheckout("PRO")}
                  disabled={!!checkingOut}
                  className="group relative flex flex-col gap-3 rounded-xl border border-blue-500/30 bg-blue-500/5 p-5 text-left transition hover:border-blue-500/60 hover:bg-blue-500/10 disabled:opacity-50"
                >
                  <div className="absolute right-3 top-3 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-blue-400">
                    Recommandé
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/15">
                    <CloudIcon className="size-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold text-foreground">Plan Pro</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">Tous les modules, hébergement inclus, support prioritaire.</p>
                  </div>
                  <p className="font-mono text-lg font-bold text-blue-500">{checkingOut === "PRO" ? "..." : "5€ / mois"}</p>
                  <div className="space-y-1">
                    {["Bots illimités", "Tous les modules", "Uptime 24/7", "Support prioritaire Discord"].map((f) => (
                      <p key={f} className="font-mono text-[10px] text-muted-foreground">✓ {f}</p>
                    ))}
                  </div>
                </button>

                {/* Plan Zip */}
                <button
                  onClick={() => handleCheckout("ZIP")}
                  disabled={!!checkingOut}
                  className="group relative flex flex-col gap-3 rounded-xl border border-dashed p-5 text-left transition hover:border-blue-500/40 hover:bg-blue-500/5 disabled:opacity-50"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <ServerIcon className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold text-foreground">Livraison .zip</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">Reçois les fichiers de ton bot, tu gères tout toi-même.</p>
                  </div>
                  <p className="font-mono text-lg font-bold text-blue-500">{checkingOut === "ZIP" ? "..." : "49€ — paiement unique"}</p>
                  <div className="space-y-1">
                    {["Fichiers source complets", "Tous les modules inclus", "Hébergement à ta charge", "Support par email"].map((f) => (
                      <p key={f} className="font-mono text-[10px] text-muted-foreground">✓ {f}</p>
                    ))}
                  </div>
                </button>
              </div>

              <p className="mt-4 text-center font-mono text-[9px] text-muted-foreground/50">
                Paiement sécurisé via Stripe — Annulation à tout moment pour le plan mensuel
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog confirmation annulation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler l&apos;abonnement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ton bot restera actif jusqu&apos;à la fin de la période déjà payée, puis sera automatiquement arrêté. Tu pourras toujours le relancer en souscrivant à nouveau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Garder l&apos;abonnement</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {cancelling ? "Annulation..." : "Confirmer l'annulation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
