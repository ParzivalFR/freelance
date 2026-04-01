"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaDiscord } from "react-icons/fa";
import { AlertTriangle, Terminal } from "lucide-react";
import { StatCard, PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import type { BotConfig } from "@/components/dashboard/bot-types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface RefundRequest {
  id: string;
  status: string;
  reason: string;
  createdAt: string;
  processedAt: string | null;
  adminNote: string | null;
}

export default function BotOverviewPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { toast } = useToast();

  const [config, setConfig] = useState<BotConfig | null>(null);
  const [refundRequest, setRefundRequest] = useState<RefundRequest | null | undefined>(undefined);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "> SYSTEM_BOOT..................OK",
    "> LOADING_ENGINE..............OK",
    "> AWAITING_CONFIG.............READY",
  ]);

  const addLog = (msg: string) =>
    setLogs((prev) => [...prev.slice(-6), `> ${msg}`]);

  useEffect(() => {
    if (!botId) return;

    fetch(`/api/bot/config?botId=${botId}`)
      .then((r) => r.json())
      .then((data) => {
        setConfig({ ...data, config: data.config ?? {} });
        addLog(`BOT_LOADED: ${data.name}`);
      });

    fetch(`/api/bot/${botId}/refund-request`)
      .then((r) => r.json())
      .then((data) => setRefundRequest(data))
      .catch(() => setRefundRequest(null));

    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      const plan = params.get("plan");
      addLog(`PAYMENT_SUCCESS: ${plan}.....OK`);
      window.history.replaceState({}, "", `/dashboard/bot/${botId}`);
    }
    if (params.get("cancelled")) {
      addLog("PAYMENT_CANCELLED.........");
      window.history.replaceState({}, "", `/dashboard/bot/${botId}`);
    }

    const interval = setInterval(() => {
      fetch(`/api/bot/config?botId=${botId}`)
        .then((r) => r.json())
        .then((data) => {
          setConfig((prev) => {
            if (!prev) return prev;
            if (prev.status !== data.status) {
              addLog(`BOT_STATUS: ${data.status}`);
            }
            return { ...prev, status: data.status };
          });
        })
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [botId]);

  const submitRefund = async () => {
    if (refundReason.trim().length < 10) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bot/${botId}/refund-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: refundReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
        return;
      }
      setRefundRequest(data);
      setRefundOpen(false);
      setRefundReason("");
      toast({ title: "Demande envoyée", description: "Nous traitons ta demande de remboursement." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!config) return <LoadingScreen />;

  const activeModules = [
    config.moduleWelcome,
    config.moduleModeration,
    config.moduleTickets,
    config.moduleLevel,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<FaDiscord className="size-4" />}
        title="Vue d'ensemble"
        subtitle="Moteur propriétaire — v1.0.0"
        status={config.status}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="bot_status"
          value={config.status}
          sub={
            config.status === "ONLINE"
              ? "Connecté et opérationnel"
              : "Inactif — déploiement requis"
          }
          accent={config.status === "ONLINE"}
          pulse
        />
        <StatCard
          label="modules_actifs"
          value={`${activeModules} / 4`}
          sub={`${4 - activeModules} module(s) disponible(s)`}
          accent={activeModules > 0}
        />
        <StatCard
          label="token"
          value={config.token ? "CONFIGURÉ" : "MANQUANT"}
          sub={
            config.token
              ? "Chiffré — connexion sécurisée"
              : "Token requis pour déployer"
          }
          accent={!!config.token}
        />
      </div>

      {/* Plan badge */}
      <div className="flex items-center gap-3 rounded-xl border border-dashed bg-card px-4 py-3">
        <div className="flex-1">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">plan_actif</p>
          <p className="mt-1 font-mono text-sm font-bold text-foreground">
            {config.plan === "RAR"
              ? "Livraison .zip"
              : config.plan === "MANAGED"
                ? "Bot Géré 24/7"
                : "Aucun plan"}
          </p>
        </div>
        <div
          className={`rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest ${
            config.plan
              ? "border border-green-500/30 bg-green-500/10 text-green-500"
              : "border border-dashed text-muted-foreground/40"
          }`}
        >
          {config.plan ?? "FREE"}
        </div>
      </div>

      {/* Refund section — only shown if bot has a paid plan */}
      {config.plan && refundRequest !== undefined && (
        <div className="rounded-xl border border-dashed bg-card px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">rétractation</p>
              {refundRequest === null ? (
                <p className="mt-1 font-mono text-xs text-muted-foreground/60">
                  Insatisfait ? Tu peux demander un remboursement.
                </p>
              ) : refundRequest.status === "PENDING" ? (
                <p className="mt-1 font-mono text-xs text-yellow-500">Demande en cours d'examen…</p>
              ) : refundRequest.status === "APPROVED" ? (
                <p className="mt-1 font-mono text-xs text-green-500">Remboursement approuvé ✓</p>
              ) : (
                <p className="mt-1 font-mono text-xs text-red-400">
                  Demande refusée{refundRequest.adminNote ? ` — ${refundRequest.adminNote}` : ""}
                </p>
              )}
            </div>
            {refundRequest === null && (
              <button
                onClick={() => setRefundOpen(true)}
                className="shrink-0 rounded-lg border border-dashed border-red-500/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-red-400 transition hover:bg-red-500/10"
              >
                Demander un remboursement
              </button>
            )}
          </div>
        </div>
      )}

      {/* Terminal logs */}
      <div className="rounded-xl border border-dashed bg-card">
        <div className="flex items-center gap-2 border-b border-dashed px-4 py-3">
          <Terminal className="size-3.5 text-muted-foreground/50" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            system_log
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="size-1.5 animate-pulse rounded-full bg-green-500" />
            <span className="font-mono text-[9px] uppercase text-muted-foreground/50">live</span>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-1">
            {logs.map((log, i) => (
              <motion.p
                key={`${log}-${i}`}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className={`font-mono text-[11px] ${
                  i === logs.length - 1
                    ? "text-blue-500"
                    : "text-muted-foreground/40"
                }`}
              >
                {log}
              </motion.p>
            ))}
          </div>
        </div>
      </div>

      <p className="pb-2 text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30">
        bot-engine v1.0.0 — moteur propriétaire — connexion chiffrée
      </p>

      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-red-400" />
              Demande de remboursement
            </DialogTitle>
            <DialogDescription>
              Explique pourquoi tu souhaites te rétracter. Ta demande sera examinée manuellement.
              Le bot sera désactivé et ton paiement remboursé si la demande est approuvée.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Raison de la demande de remboursement (min. 10 caractères)…"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            rows={4}
            className="font-mono text-sm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundOpen(false)} disabled={submitting}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={submitRefund}
              disabled={submitting || refundReason.trim().length < 10}
            >
              {submitting ? "Envoi…" : "Envoyer la demande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
