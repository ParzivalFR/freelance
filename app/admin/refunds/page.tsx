"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle, RotateCw, XCircle } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="border-b border-border/40 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Demandes de remboursement</h1>
            <p className="mt-2 text-muted-foreground">
              {pending > 0 ? (
                <span className="text-yellow-600">{pending} demande(s) en attente</span>
              ) : (
                "Aucune demande en attente"
              )}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
            <RotateCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Bot</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Chargement…
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Aucune demande de remboursement
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((r) => {
                  const status = statusConfig[r.status] ?? statusConfig.PENDING;
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.user.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{r.user.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{r.bot.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">{r.bot.id.slice(0, 8)}…</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.bot.plan ?? "—"}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="line-clamp-2 text-sm text-muted-foreground">{r.reason}</p>
                        {r.adminNote && (
                          <p className="mt-1 text-xs italic text-muted-foreground/60">Note : {r.adminNote}</p>
                        )}
                        {r.stripeRefundId && (
                          <p className="mt-1 font-mono text-[10px] text-green-600">↳ {r.stripeRefundId}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.classes}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {format(new Date(r.createdAt), "dd MMM yyyy", { locale: fr })}
                        </div>
                        {r.processedAt && (
                          <div className="text-xs text-muted-foreground">
                            traité {format(new Date(r.processedAt), "dd MMM", { locale: fr })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {r.status === "PENDING" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-600 border-green-200 hover:bg-green-50"
                              disabled={!!processing}
                              onClick={() => openAction(r.id, "approve")}
                            >
                              <CheckCircle className="mr-1.5 size-3.5" />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-600 border-red-200 hover:bg-red-50"
                              disabled={!!processing}
                              onClick={() => openAction(r.id, "deny")}
                            >
                              <XCircle className="mr-1.5 size-3.5" />
                              Refuser
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
