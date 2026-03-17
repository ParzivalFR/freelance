"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Rocket, Power, RotateCw, Square } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import { PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";

export default function BotDeployPage() {
  const { config, setConfig } = useBotConfig();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [checkingOut, setCheckingOut] = useState<"RAR" | "MANAGED" | null>(null);
  const [workerLoading, setWorkerLoading] = useState<"START" | "STOP" | "RESTART" | null>(null);

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
        if (res.ok) {
          const updated = await res.json();
          setConfig(updated);
        }
      } finally {
        setWorkerLoading(null);
      }
    },
    [config, setConfig]
  );

  const handleCheckout = useCallback(
    async (plan: "RAR" | "MANAGED") => {
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

  if (!config) return <LoadingScreen />;

  const hasPlan = !!config.plan;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Rocket className="size-4" />}
        title="Déploiement"
        subtitle="Choisir et gérer ton plan"
        status={config.status}
      />

      {/* Current plan status */}
      {config.plan === "RAR" && (
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

      {config.plan === "MANAGED" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/15 text-2xl">
                🚀
              </div>
              <div>
                <p className="font-mono text-xs font-bold text-green-500">Bot géré — actif 24/7</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Ton bot est hébergé et géré par nos soins. Aucune intervention requise.
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["Uptime 24/7 garanti", "Mises à jour automatiques", "Support prioritaire", "Monitoring inclus"].map(
                (f) => (
                  <p key={f} className="font-mono text-[10px] text-muted-foreground">
                    ✓ {f}
                  </p>
                )
              )}
            </div>
          </div>

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
        </div>
      )}

      {!hasPlan && (
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed bg-card p-4">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              prérequis avant de déployer
            </p>
            <div className="mt-3 space-y-2">
              {[
                { ok: !!config.token, label: "Token Discord configuré" },
                {
                  ok: config.moduleWelcome || config.moduleModeration || config.moduleTickets,
                  label: "Au moins un module activé",
                },
                { ok: !!config.name, label: "Nom du bot défini" },
              ].map(({ ok, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`size-1.5 rounded-full ${ok ? "bg-green-500" : "bg-muted-foreground/30"}`}
                  />
                  <span
                    className={`font-mono text-[11px] ${ok ? "text-foreground" : "text-muted-foreground/50"}`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowPlanModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition hover:bg-blue-500"
          >
            <Rocket className="size-4" />
            deploy_bot ▶
          </button>
        </div>
      )}

      {/* Discord integration info */}
      <div className="rounded-xl border border-dashed bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <FaDiscord className="size-3.5 text-muted-foreground/50" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            invite_du_bot
          </span>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground/70">
          Pour inviter ton bot sur un serveur Discord, génère un lien d'invitation depuis le{" "}
          <span className="text-blue-400">Portal Développeur Discord</span> avec les permissions
          nécessaires (Administrator ou permissions manuelles).
        </p>
      </div>

      {/* Plan modal */}
      <AnimatePresence>
        {showPlanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
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
                  <h2 className="font-mono text-sm font-bold text-foreground">
                    Choisir un plan de déploiement
                  </h2>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Sélectionne comment tu veux recevoir ton bot
                  </p>
                </div>
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={() => handleCheckout("RAR")}
                  disabled={!!checkingOut}
                  className="group relative flex flex-col gap-3 rounded-xl border border-dashed p-5 text-left transition hover:border-blue-500/40 hover:bg-blue-500/5 disabled:opacity-50"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-xl">
                    📦
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold text-foreground">Livraison .zip</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      Reçois les fichiers de ton bot, tu gères tout toi-même.
                    </p>
                  </div>
                  <p className="font-mono text-lg font-bold text-blue-500">
                    {checkingOut === "RAR" ? "..." : "49€ — paiement unique"}
                  </p>
                  <div className="space-y-1">
                    {[
                      "Fichiers source complets",
                      "Token Discord inclus",
                      "Hébergement à ta charge",
                      "Support par email",
                    ].map((f) => (
                      <p key={f} className="font-mono text-[10px] text-muted-foreground">
                        ✓ {f}
                      </p>
                    ))}
                  </div>
                </button>

                <button
                  onClick={() => handleCheckout("MANAGED")}
                  disabled={!!checkingOut}
                  className="group relative flex flex-col gap-3 rounded-xl border border-blue-500/30 bg-blue-500/5 p-5 text-left transition hover:border-blue-500/60 hover:bg-blue-500/10 disabled:opacity-50"
                >
                  <div className="absolute right-3 top-3 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-blue-400">
                    Recommandé
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/15 text-xl">
                    🚀
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold text-foreground">Bot géré par nous</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      On héberge et gère tout. Ton bot tourne 24/7 sans intervention.
                    </p>
                  </div>
                  <p className="font-mono text-lg font-bold text-blue-500">
                    {checkingOut === "MANAGED" ? "..." : "19€ / mois"}
                  </p>
                  <div className="space-y-1">
                    {[
                      "Déploiement immédiat",
                      "Uptime 24/7 garanti",
                      "Mises à jour incluses",
                      "Support prioritaire",
                    ].map((f) => (
                      <p key={f} className="font-mono text-[10px] text-muted-foreground">
                        ✓ {f}
                      </p>
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
    </div>
  );
}
