"use client";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle, Clock, Loader2, ReceiptText, RotateCw, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface RefundRequest {
  id: string;
  status: string;
  reason: string;
  stripeRefundId: string | null;
  adminNote: string | null;
  createdAt: string;
  processedAt: string | null;
  bot: {
    id: string;
    name: string;
    plan: string | null;
    stripeSubscriptionId: string | null;
    stripeSessionId: string | null;
    paidAt: string | null;
  };
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  PENDING:  { label: "En attente", classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300" },
  APPROVED: { label: "Approuvée",  classes: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" },
  DENIED:   { label: "Refusée",    classes: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" },
};

export default function AdminRefundsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const [actionTarget, setActionTarget] = useState<{ id: string; action: "approve" | "deny" } | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [skipStripe, setSkipStripe] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/refunds");
      if (res.ok) setRequests(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const openAction = (id: string, action: "approve" | "deny") => {
    setAdminNote("");
    setSkipStripe(false);
    setActionTarget({ id, action });
  };

  const confirmAction = async () => {
    if (!actionTarget) return;
    setProcessing(actionTarget.id);
    try {
      const res = await fetch(`/api/admin/refunds/${actionTarget.id}/${actionTarget.action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminNote: adminNote || undefined,
          ...(actionTarget.action === "approve" && { skipStripe }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur Stripe", description: data.error, variant: "destructive" });
        return;
      }
      if (actionTarget.action === "approve") {
        toast({
          title: "Remboursement approuvé",
          description: data.stripeRefundId
            ? `Stripe refund: ${data.stripeRefundId}`
            : "Approuvé — traitement Stripe à effectuer manuellement.",
        });
      } else {
        toast({ title: "Demande refusée", description: "Le client a été notifié." });
      }
      setActionTarget(null);
      await fetchRequests();
    } finally {
      setProcessing(null);
    }
  };

  const pending = requests.filter((r) => r.status === "PENDING").length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;
  const denied = requests.filter((r) => r.status === "DENIED").length;

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader
        eyebrow="Service après-vente"
        title="Rembour"
        titleAccent="sements"
        description="Chaque demande déclenche (ou non) un remboursement Stripe et la désactivation du bot concerné. Vérifiez la raison avant de trancher."
        actions={
          <Button variant="outline" onClick={fetchRequests} disabled={loading}>
            <RotateCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="En attente"
          value={pending}
          sub={pending > 0 ? "À traiter maintenant" : "Rien à traiter"}
          icon={Clock}
          highlight={pending > 0}
        />
        <StatCard label="Approuvées" value={approved} sub="Remboursements effectués" icon={CheckCircle} />
        <StatCard label="Refusées" value={denied} sub="Demandes rejetées" icon={XCircle} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed bg-card p-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-[#7158ff]" />
          Chargement des demandes…
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="Aucune demande de remboursement"
          description="Les demandes envoyées depuis le dashboard client apparaîtront ici, avec la raison invoquée."
        />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const status = statusConfig[r.status] ?? statusConfig.PENDING;
            const isPending = r.status === "PENDING";
            return (
              <div
                key={r.id}
                className={`rounded-2xl border bg-card p-5 transition-colors hover:border-[#7158ff]/40 ${
                  isPending ? "border-[#7158ff]/40 ring-4 ring-[#7158ff]/10" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {r.user.name ?? r.user.email ?? "Client inconnu"}
                      </h3>
                      <Badge className={status.classes}>{status.label}</Badge>
                      <Badge variant="outline">{r.bot.plan ?? "sans plan"}</Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-muted-foreground md:grid-cols-2">
                      <p>{r.user.email ?? "—"}</p>
                      <p>
                        Bot : {r.bot.name}{" "}
                        <span className="font-mono text-xs">({r.bot.id.slice(0, 8)}…)</span>
                      </p>
                      <p>
                        Demandé le{" "}
                        {format(new Date(r.createdAt), "dd MMMM yyyy", { locale: fr })}
                      </p>
                      {r.processedAt && (
                        <p>
                          Traité le{" "}
                          {format(new Date(r.processedAt), "dd MMMM yyyy", { locale: fr })}
                        </p>
                      )}
                    </div>

                    <p className="mt-3 rounded-xl bg-muted/50 p-3 text-sm text-foreground">
                      {r.reason}
                    </p>

                    {r.adminNote && (
                      <p className="mt-2 text-xs italic text-muted-foreground">
                        Votre note : {r.adminNote}
                      </p>
                    )}
                    {r.stripeRefundId && (
                      <p className="mt-2 font-mono text-xs text-green-600 dark:text-green-400">
                        Stripe : {r.stripeRefundId}
                      </p>
                    )}
                  </div>

                  {isPending && (
                    <div className="flex shrink-0 flex-col gap-2">
                      <Button
                        size="sm"
                        disabled={!!processing}
                        onClick={() => openAction(r.id, "approve")}
                      >
                        <CheckCircle className="mr-1.5 size-4" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-600"
                        disabled={!!processing}
                        onClick={() => openAction(r.id, "deny")}
                      >
                        <XCircle className="mr-1.5 size-4" />
                        Refuser
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!actionTarget} onOpenChange={(open) => !open && setActionTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionTarget?.action === "approve" ? "Approuver le remboursement" : "Refuser le remboursement"}
            </DialogTitle>
            <DialogDescription>
              {actionTarget?.action === "approve"
                ? "Le remboursement Stripe sera déclenché automatiquement et le bot désactivé."
                : "Le client conserve son accès et aucun remboursement ne sera effectué."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Note admin (optionnel)</label>
              <Textarea
                placeholder="Message visible par le client…"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
              />
            </div>
            {actionTarget?.action === "approve" && (
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipStripe}
                  onChange={(e) => setSkipStripe(e.target.checked)}
                  className="rounded"
                />
                Approuver sans déclencher le remboursement Stripe (remboursement manuel)
              </label>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionTarget(null)} disabled={!!processing}>
              Annuler
            </Button>
            <Button
              variant={actionTarget?.action === "approve" ? "default" : "destructive"}
              onClick={confirmAction}
              disabled={!!processing}
            >
              {processing ? "Traitement…" : actionTarget?.action === "approve" ? "Confirmer le remboursement" : "Confirmer le refus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
