"use client";

import { Save, Rocket, ExternalLink, Clock, Users } from "lucide-react";
import { PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useParams } from "next/navigation";
import {
  ChannelSelect,
  RoleSelect,
} from "@/components/dashboard/discord-select";
import { useEffect, useState } from "react";

interface QuestRow {
  id: string;
  title: string;
  type: string;
  nature: string;
  status: string;
  budget: string | null;
  deadline: string | null;
  guildId: string;
  channelId: string;
  messageId: string;
  createdAt: string;
  applications: { id: string }[];
}

function statusBadge(status: string) {
  if (status === "closed")
    return <span className="text-green-400">🟢 Terminée</span>;
  if (status === "in_progress")
    return <span className="text-blue-400">🔵 En cours</span>;
  return <span className="text-yellow-400">🟡 Ouverte</span>;
}

export default function QuestsPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();
  const [quests, setQuests] = useState<QuestRow[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(true);

  useEffect(() => {
    if (!botId) return;
    fetch(`/api/bot/quests?botId=${botId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setQuests(data);
      })
      .catch(() => {})
      .finally(() => setLoadingQuests(false));
  }, [botId]);

  if (!config) return <LoadingScreen />;

  const c = config.config;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Rocket className="size-4" />}
        title="Quêtes"
        subtitle="Système de quêtes bénévoles & contrats via forum Discord"
        status={config.status}
      />

      {/* ── Salons ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          salons (texte)
        </p>

        <ChannelSelect
          botId={botId}
          label="salon_bénévoles"
          value={c.questsBenevoleChannelId ?? ""}
          onChange={(v) => updateModuleConfig("questsBenevoleChannelId", v)}
          filter="text"
        />

        <ChannelSelect
          botId={botId}
          label="salon_contrats"
          value={c.questsContratChannelId ?? ""}
          onChange={(v) => updateModuleConfig("questsContratChannelId", v)}
          filter="text"
        />
      </div>

      {/* ── Rôles de notification ───────────────────────────────────── */}
      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          notifications
        </p>

        <RoleSelect
          botId={botId}
          label="notif_bénévoles"
          value={c.questsNotifBenevoleRoleId ?? ""}
          onChange={(v) => updateModuleConfig("questsNotifBenevoleRoleId", v)}
        />

        <RoleSelect
          botId={botId}
          label="notif_contrats"
          value={c.questsNotifContratRoleId ?? ""}
          onChange={(v) => updateModuleConfig("questsNotifContratRoleId", v)}
        />
      </div>

      {/* ── Rôles staff ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          rôles staff
        </p>

        <RoleSelect
          botId={botId}
          label="garde_aubergiste (peut clore toute quête)"
          value={c.questsGardeRoleId ?? ""}
          onChange={(v) => updateModuleConfig("questsGardeRoleId", v)}
        />

        <RoleSelect
          botId={botId}
          label="maître_artisan (badge ⭐ sur candidature)"
          value={c.questsMaitreArtisanRoleId ?? ""}
          onChange={(v) => updateModuleConfig("questsMaitreArtisanRoleId", v)}
        />
      </div>

      {/* ── Bouton save ─────────────────────────────────────────────── */}
      <div className="flex justify-end pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg border border-dashed px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Save className="size-3.5" />
          {saved ? "✓ saved" : saving ? "saving..." : "save_config"}
        </button>
      </div>

      {/* ── Liste des quêtes ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          quêtes récentes (50 dernières)
        </p>

        {loadingQuests ? (
          <p className="font-mono text-xs text-muted-foreground/50">
            Chargement...
          </p>
        ) : quests.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground/50">
            Aucune quête postée.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-dashed">
            <table className="w-full text-left font-mono text-[10px]">
              <thead>
                <tr className="border-b border-dashed text-muted-foreground/60 uppercase tracking-widest">
                  <th className="px-3 py-2">Titre</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Nature</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">
                    <Users className="inline size-3" />
                  </th>
                  <th className="px-3 py-2">
                    <Clock className="inline size-3" />
                  </th>
                  <th className="px-3 py-2">Lien</th>
                </tr>
              </thead>
              <tbody>
                {quests.map((q) => (
                  <tr
                    key={q.id}
                    className="border-b border-dashed last:border-0 hover:bg-muted/30 transition"
                  >
                    <td className="px-3 py-2 max-w-[180px] truncate">
                      {q.title}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {q.type}
                    </td>
                    <td className="px-3 py-2">
                      {q.nature === "benevole" ? "Bénévole" : "Rémunérée"}
                    </td>
                    <td className="px-3 py-2">{statusBadge(q.status)}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {q.applications.length}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {q.deadline ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      <a
                        href={`https://discord.com/channels/${q.guildId}/${q.channelId}/${q.messageId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="size-3" />
                        ouvrir
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
