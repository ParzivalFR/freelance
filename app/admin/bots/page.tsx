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
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Bot,
  Loader2,
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
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader
        eyebrow="Le parc hébergé"
        title="Bots "
        titleAccent="Discord"
        description="Tous les bots créés par vos clients. Les contrôles start/stop/restart ne s'appliquent qu'aux plans Pro et Géré, les seuls réellement hébergés chez vous."
        actions={
          <Button variant="outline" onClick={fetchBots} disabled={loading}>
            <RotateCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total bots" value={stats.total} sub="Tous plans confondus" icon={Bot} />
        <StatCard label="Gérés" value={stats.managed} sub="Hébergés sur le VPS" icon={Power} />
        <StatCard label="Livraison" value={stats.rar} sub="Archives téléchargées" icon={Square} />
        <StatCard
          label="En ligne"
          value={stats.online}
          sub={`${Math.max(stats.managed - stats.online, 0)} hors ligne`}
          icon={RefreshCw}
        />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom de bot ou email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed bg-card p-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-[#7158ff]" />
          Chargement des bots…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bot}
          title={search ? "Aucun bot ne correspond" : "Aucun bot pour le moment"}
          description={
            search
              ? "Essayez avec le nom du bot ou l'adresse email du client."
              : "Les bots créés par vos clients depuis le générateur apparaîtront ici."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((bot) => {
            const status = statusConfig[bot.status] ?? statusConfig.OFFLINE;
            const plan = bot.plan ? planConfig[bot.plan] : null;
            const modules = activeModules(bot);
            const isManaged = bot.plan === "PRO" || bot.plan === "MANAGED";

            return (
              <div
                key={bot.id}
                className="rounded-2xl border bg-card p-5 transition-colors hover:border-[#7158ff]/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">{bot.name}</h3>
                      <Badge className={status.classes}>{status.label}</Badge>
                      {plan ? (
                        <Badge className={plan.classes}>{plan.label}</Badge>
                      ) : (
                        <Badge variant="outline">Sans plan</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-muted-foreground md:grid-cols-2">
                      <p>
                        {bot.user.name ?? "Client sans nom"} · {bot.user.email ?? "—"}
                      </p>
                      <p>Préfixe : {bot.prefix}</p>
                      <p>
                        Créé le {format(new Date(bot.createdAt), "dd MMMM yyyy", { locale: fr })}
                      </p>
                      <p>
                        Dernier signe de vie :{" "}
                        {bot.lastHeartbeatAt
                          ? format(new Date(bot.lastHeartbeatAt), "dd MMM à HH:mm", { locale: fr })
                          : "jamais"}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {modules.length > 0 ? (
                        modules.map((m) => (
                          <Badge key={m} variant="outline" className="text-[11px]">
                            {m}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">Aucun module activé</span>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={!!sending} className="shrink-0">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isManaged ? (
                        <>
                          {bot.status === "OFFLINE" || bot.status === "ERROR" ? (
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
                      ) : (
                        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                          Contrôles réservés aux plans Pro / Géré
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
                </div>
              </div>
            );
          })}
        </div>
      )}

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
