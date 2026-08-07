"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Archive, Trash2 } from "lucide-react";
import { PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useToast } from "@/components/ui/use-toast";

interface BackupSummary {
  id: string;
  name: string | null;
  createdBy: string;
  createdAt: string;
  roleCount: number;
  categoryCount: number;
  channelCount: number;
}

export default function BackupPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config } = useBotConfig();
  const { toast } = useToast();

  const [backups, setBackups] = useState<BackupSummary[] | null>(null);

  async function load() {
    const res = await fetch(`/api/bot/backup?botId=${botId}`);
    if (res.ok) setBackups(await res.json());
  }

  useEffect(() => {
    if (botId) load();
  }, [botId]);

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

  if (!config || backups === null) return <LoadingScreen />;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Archive className="size-4" />}
        title="Sauvegardes"
        subtitle="Snapshot de la structure du serveur (rôles, catégories, salons) pour reconstruire après un nuke"
        status={config.status}
      />

      <div className="rounded-xl border border-dashed bg-card p-4 space-y-1">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">créer / restaurer</p>
        <p className="font-mono text-[10px] text-muted-foreground/70">
          /backup create [nom] — /backup restore [id] — /backup delete [id]
        </p>
        <p className="font-mono text-[9px] text-muted-foreground/50 pt-1">
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
            <button onClick={() => remove(b.id)} className="text-red-400 hover:text-red-300 shrink-0">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
