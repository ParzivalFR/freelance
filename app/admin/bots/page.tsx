"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Bot,
  MoreHorizontal,
  Power,
  RefreshCw,
  RotateCw,
  Search,
  Square,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface DiscordBot {
  id: string;
  name: string;
  status: string;
  plan: string | null;
  token: string | null;
  prefix: string;
  moduleWelcome: boolean;
  moduleModeration: boolean;
  moduleTickets: boolean;
  moduleLevel: boolean;
  moduleLog: boolean;
  lastHeartbeatAt: string | null;
  createdAt: string;
  workerCommand: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  ONLINE:   { label: "En ligne",   classes: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" },
  OFFLINE:  { label: "Hors ligne", classes: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300" },
  STARTING: { label: "Démarrage",  classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300" },
  ERROR:    { label: "Erreur",     classes: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" },
};

const planConfig: Record<string, { label: string; classes: string }> = {
  PRO:     { label: "Pro",       classes: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300" },
  MANAGED: { label: "Géré",      classes: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300" },
  ZIP:     { label: "Livraison", classes: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300" },
  RAR:     { label: "Livraison", classes: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300" },
};

export default function AdminBotsPage() {
  const { toast } = useToast();
  const [bots, setBots] = useState<DiscordBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DiscordBot | null>(null);

  const fetchBots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bots");
      if (res.ok) setBots(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBots(); }, [fetchBots]);

  const sendCommand = async (botId: string, cmd: "START" | "STOP" | "RESTART") => {
    setSending(botId + cmd);
    try {
      const res = await fetch(`/api/admin/bots/${botId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerCommand: cmd }),
      });
      if (res.ok) {
        const labels = { START: "démarrage", STOP: "arrêt", RESTART: "redémarrage" };
        toast({ title: `Commande envoyée`, description: `${labels[cmd]} en cours...` });
      }
      await fetchBots();
    } finally {
      setSending(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSending(deleteTarget.id + "DELETE");
    try {
      const res = await fetch(`/api/admin/bots/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Bot supprimé", description: `"${deleteTarget.name}" a été supprimé.` });
        await fetchBots();
      } else {
        toast({ title: "Erreur", description: "Impossible de supprimer le bot.", variant: "destructive" });
      }
    } finally {
      setSending(null);
      setDeleteTarget(null);
    }
  };

  const filtered = bots.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.user.email?.toLowerCase().includes(q) ||
      b.user.name?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total:   bots.length,
    managed: bots.filter((b) => b.plan === "PRO" || b.plan === "MANAGED").length,
    rar:     bots.filter((b) => b.plan === "ZIP" || b.plan === "RAR").length,
    online:  bots.filter((b) => b.status === "ONLINE").length,
  };

  const activeModules = (bot: DiscordBot) =>
    [
      bot.moduleWelcome    && "welcome",
      bot.moduleModeration && "modération",
      bot.moduleTickets    && "tickets",
      bot.moduleLevel      && "levels",
      bot.moduleLog        && "logs",
    ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bots Discord</h1>
            <p className="mt-2 text-muted-foreground">Gestion de tous les bots clients</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchBots} disabled={loading}>
            <RotateCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total bots",      value: stats.total,   icon: Bot,       color: "text-blue-600" },
          { label: "Gérés (MANAGED)", value: stats.managed, icon: Power,     color: "text-green-600" },
          { label: "Livraison (ZIP)", value: stats.rar,     icon: Square,    color: "text-purple-600" },
          { label: "En ligne",        value: stats.online,  icon: RefreshCw, color: "text-emerald-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className={`size-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tableau */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bot</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Heartbeat</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    Aucun bot trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((bot) => {
                  const status = statusConfig[bot.status] ?? statusConfig.OFFLINE;
                  const plan = bot.plan ? planConfig[bot.plan] : null;
                  const modules = activeModules(bot);
                  const isManaged = bot.plan === "PRO" || bot.plan === "MANAGED";

                  return (
                    <TableRow key={bot.id}>
                      <TableCell>
                        <div className="font-medium">{bot.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          prefix: {bot.prefix}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{bot.user.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{bot.user.email}</div>
                      </TableCell>
                      <TableCell>
                        {plan ? (
                          <Badge className={plan.classes}>{plan.label}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sans plan</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.classes}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {modules.length > 0 ? modules.map((m) => (
                            <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>
                          )) : (
                            <span className="text-xs text-muted-foreground">Aucun</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {bot.lastHeartbeatAt ? (
                          <span className="text-xs">
                            {format(new Date(bot.lastHeartbeatAt), "dd MMM HH:mm", { locale: fr })}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Jamais</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(bot.createdAt), "dd MMM yyyy", { locale: fr })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={!!sending}>
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {isManaged && (
                              <>
                                {(bot.status === "OFFLINE" || bot.status === "ERROR") ? (
                                  <DropdownMenuItem onClick={() => sendCommand(bot.id, "START")}>
                                    <Power className="mr-2 size-4 text-green-500" />
                                    Démarrer
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => sendCommand(bot.id, "STOP")}>
                                    <Square className="mr-2 size-4 text-red-500" />
                                    Arrêter
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => sendCommand(bot.id, "RESTART")}>
                                  <RotateCw className="mr-2 size-4 text-blue-500" />
                                  Redémarrer
                                </DropdownMenuItem>
                              </>
                            )}
                            {!isManaged && (
                              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                                Contrôles réservés au plan Pro/Géré
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => setDeleteTarget(bot)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AlertDialog suppression */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce bot ?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu es sur le point de supprimer <span className="font-semibold text-foreground">"{deleteTarget?.name}"</span> (client : {deleteTarget?.user.email}).
              <br />
              Cette action est irréversible — toutes les données associées (infractions, levels, rewards) seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
