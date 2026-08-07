"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Archive, Eye, Folder, Hash, Plus, RefreshCw, RotateCcw, Trash2, Volume2 } from "lucide-react";
import { PageHeader, LoadingScreen, CyberInput } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useToast } from "@/components/ui/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BackupSummary {
  id: string;
  name: string | null;
  createdBy: string;
  createdAt: string;
  roleCount: number;
  categoryCount: number;
  channelCount: number;
}

interface SnapshotRole {
  name: string;
  color: number;
  hoist: boolean;
  mentionable: boolean;
  position: number;
}

interface SnapshotChannel {
  name: string;
  type: number;
  topic: string | null;
  position: number;
  categoryName: string | null;
}

interface Snapshot {
  roles: SnapshotRole[];
  categories: { name: string; position: number }[];
  channels: SnapshotChannel[];
}

const CHANNEL_TYPE_LABEL: Record<number, string> = { 0: "texte", 2: "vocal", 5: "annonces", 13: "stage", 15: "forum" };

function roleColorHex(color: number): string {
  if (color === 0) return "#99a1af"; // gris par défaut si le rôle n'a pas de couleur
  return `#${color.toString(16).padStart(6, "0")}`;
}

export default function BackupPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config } = useBotConfig();
  const { toast } = useToast();

  const [backups, setBackups] = useState<BackupSummary[] | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<BackupSummary | null>(null);
  const [viewing, setViewing] = useState<BackupSummary | null>(null);
  const [viewingSnapshot, setViewingSnapshot] = useState<Snapshot | null>(null);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);

  async function load() {
    const res = await fetch(`/api/bot/backup?botId=${botId}`);
    if (res.ok) setBackups(await res.json());
  }

  useEffect(() => {
    if (botId) load();
  }, [botId]);

  async function create() {
    setCreating(true);
    try {
      const res = await fetch("/api/bot/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, name: name.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error ?? "Création impossible.", variant: "destructive" });
        return;
      }
      toast({ title: "Sauvegarde créée", description: `${data.roleCount} rôles, ${data.categoryCount} catégories, ${data.channelCount} salons.` });
      setName("");
      load();
    } finally {
      setCreating(false);
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/bot/backup?id=${id}&botId=${botId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      toast({ title: "Erreur", description: data.error ?? "Suppression impossible.", variant: "destructive" });
      return;
    }
    setBackups((prev) => prev?.filter((b) => b.id !== id) ?? null);
    toast({ title: "Sauvegarde supprimée" });
  }

  async function view(b: BackupSummary) {
    setViewing(b);
    setLoadingSnapshot(true);
    setViewingSnapshot(null);
    try {
      const res = await fetch(`/api/bot/backup/${b.id}?botId=${botId}`);
      if (res.ok) {
        const data = await res.json();
        setViewingSnapshot(data.snapshot as Snapshot);
      }
    } finally {
      setLoadingSnapshot(false);
    }
  }

  async function restore(id: string) {
    setConfirmRestore(null);
    setRestoringId(id);
    try {
      const res = await fetch("/api/bot/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, backupId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error ?? "Restauration impossible.", variant: "destructive" });
        return;
      }
      toast({ title: "Restauration terminée", description: `${data.roles} rôles, ${data.categories} catégories, ${data.channels} salons recréés.` });
    } finally {
      setRestoringId(null);
    }
  }

  if (!config || backups === null) return <LoadingScreen />;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Archive className="size-4" />}
        title="Sauvegardes"
        subtitle="Snapshot de la structure du serveur (rôles, catégories, salons) pour reconstruire après un nuke"
        status={config.status}
      />

      <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">nouvelle sauvegarde</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <CyberInput label="nom (optionnel)" value={name} onChange={setName} placeholder="ex: avant migration" />
          </div>
          <button
            onClick={create}
            disabled={creating}
            className="flex items-center gap-1.5 self-end rounded-lg border border-dashed px-4 py-2.5 font-mono text-xs font-bold text-blue-400 hover:bg-blue-500/10 disabled:opacity-40"
          >
            {creating ? <RefreshCw className="size-3 animate-spin" /> : <Plus className="size-3" />}
            créer
          </button>
        </div>
        <p className="font-mono text-[9px] text-muted-foreground/50">
          La restauration recrée la structure sans rien supprimer de l&apos;existant — pensée pour reconstruire après un nuke, pas comme un &quot;retour en arrière&quot; strict.
        </p>
      </div>

      <div className="space-y-3">
        {backups.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="font-mono text-xs text-muted-foreground">Aucune sauvegarde pour le moment.</p>
          </div>
        )}

        {backups.map((b) => (
          <div key={b.id} className="rounded-xl border border-dashed bg-card p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-xs font-bold text-foreground">
                {b.name || `Sauvegarde ${b.id.slice(0, 8)}`}
              </p>
              <p className="font-mono text-[9px] text-muted-foreground/60">
                {new Date(b.createdAt).toLocaleString("fr-FR")} · {b.roleCount} rôles · {b.categoryCount} catégories · {b.channelCount} salons
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => view(b)}
                className="flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 font-mono text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Eye className="size-3" />
                voir
              </button>
              <button
                onClick={() => setConfirmRestore(b)}
                disabled={restoringId === b.id}
                className="flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 font-mono text-[10px] text-blue-400 hover:bg-blue-500/10 disabled:opacity-40"
              >
                {restoringId === b.id ? <RefreshCw className="size-3 animate-spin" /> : <RotateCcw className="size-3" />}
                {restoringId === b.id ? "restauration…" : "restaurer"}
              </button>
              <button onClick={() => remove(b.id)} className="text-red-400 hover:text-red-300">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!confirmRestore} onOpenChange={(open) => !open && setConfirmRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurer &quot;{confirmRestore?.name || confirmRestore?.id.slice(0, 8)}&quot; ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ça va recréer {confirmRestore?.roleCount} rôle(s), {confirmRestore?.categoryCount} catégorie(s) et {confirmRestore?.channelCount} salon(s) sur ton serveur Discord.
              Ça ne supprime rien de l&apos;existant — si la structure actuelle ressemble déjà à cette sauvegarde, tu vas te retrouver avec des doublons.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmRestore && restore(confirmRestore.id)}>
              Confirmer la restauration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewing?.name || `Sauvegarde ${viewing?.id.slice(0, 8)}`}</DialogTitle>
          </DialogHeader>

          {loadingSnapshot && (
            <p className="font-mono text-xs text-muted-foreground">Chargement…</p>
          )}

          {viewingSnapshot && (
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
                  rôles ({viewingSnapshot.roles.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[...viewingSnapshot.roles].sort((a, b) => b.position - a.position).map((r) => (
                    <span
                      key={r.name}
                      className="rounded border border-dashed px-2 py-0.5 font-mono text-[10px]"
                      style={{ color: roleColorHex(r.color), borderColor: roleColorHex(r.color) + "60" }}
                    >
                      {r.hoist ? "★ " : ""}{r.name}
                    </span>
                  ))}
                  {viewingSnapshot.roles.length === 0 && (
                    <p className="font-mono text-[10px] text-muted-foreground/50">Aucun rôle.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
                  structure ({viewingSnapshot.categories.length} catégories · {viewingSnapshot.channels.length} salons)
                </p>

                {[...viewingSnapshot.categories].sort((a, b) => a.position - b.position).map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-foreground">
                      <Folder className="size-3" />
                      {cat.name.toUpperCase()}
                    </div>
                    <div className="ml-4 space-y-0.5 border-l border-dashed pl-3">
                      {viewingSnapshot.channels
                        .filter((c) => c.categoryName === cat.name)
                        .sort((a, b) => a.position - b.position)
                        .map((c) => (
                          <div key={c.name} className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                            {c.type === 2 ? <Volume2 className="size-3" /> : <Hash className="size-3" />}
                            {c.name}
                            <span className="text-muted-foreground/40">· {CHANNEL_TYPE_LABEL[c.type] ?? c.type}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}

                {viewingSnapshot.channels.filter((c) => !c.categoryName).length > 0 && (
                  <div className="space-y-0.5">
                    <p className="font-mono text-[10px] font-bold text-foreground">Sans catégorie</p>
                    {viewingSnapshot.channels
                      .filter((c) => !c.categoryName)
                      .sort((a, b) => a.position - b.position)
                      .map((c) => (
                        <div key={c.name} className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                          {c.type === 2 ? <Volume2 className="size-3" /> : <Hash className="size-3" />}
                          {c.name}
                          <span className="text-muted-foreground/40">· {CHANNEL_TYPE_LABEL[c.type] ?? c.type}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
