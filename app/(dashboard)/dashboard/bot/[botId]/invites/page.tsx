"use client";

import { Save, UserPlus, Trophy } from "lucide-react";
import { CyberInput, CyberTextarea, PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useParams } from "next/navigation";
import { ChannelSelect, RoleSelect } from "@/components/dashboard/discord-select";
import { useEffect, useState } from "react";

interface LeaderboardEntry {
  userId: string;
  regular: number;
  left: number;
  fake: number;
  bonus: number;
  score: number;
}

export default function InvitesPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingBoard, setLoadingBoard] = useState(true);

  useEffect(() => {
    if (!botId) return;
    fetch(`/api/bot/invites?botId=${botId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLeaderboard(data);
      })
      .catch(() => {})
      .finally(() => setLoadingBoard(false));
  }, [botId]);

  if (!config) return <LoadingScreen />;

  const c = config.config;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<UserPlus className="size-4" />}
        title="Invitations"
        subtitle="Tracker complet : détection d'inviteur, faux comptes, départs, bonus staff"
        status={config.status}
      />

      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          annonce d'arrivée
        </p>

        <ChannelSelect
          botId={botId}
          label="salon_annonce_arrivée (optionnel)"
          value={c.invitesJoinAnnounceChannelId ?? ""}
          onChange={(v) => updateModuleConfig("invitesJoinAnnounceChannelId", v)}
          filter="text"
        />

        <CyberTextarea
          label="message_arrivée (optionnel)"
          value={c.invitesJoinMessage ?? ""}
          onChange={(v) => updateModuleConfig("invitesJoinMessage", v)}
          placeholder="📥 {user} a rejoint le serveur, invité par {inviter} ({inviterCount} invitation(s))."
          botId={botId}
        />
        <p className="font-mono text-[9px] text-muted-foreground/50 -mt-2">
          Placeholders : {"{user}"} {"{inviter}"} {"{inviterCount}"} {"{code}"}
        </p>
      </div>

      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          annonce de départ
        </p>

        <ChannelSelect
          botId={botId}
          label="salon_annonce_départ (optionnel)"
          value={c.invitesLeaveAnnounceChannelId ?? ""}
          onChange={(v) => updateModuleConfig("invitesLeaveAnnounceChannelId", v)}
          filter="text"
        />

        <CyberTextarea
          label="message_départ (optionnel)"
          value={c.invitesLeaveMessage ?? ""}
          onChange={(v) => updateModuleConfig("invitesLeaveMessage", v)}
          placeholder="📤 {user} a quitté le serveur (invité par {inviter})."
          botId={botId}
        />
        <p className="font-mono text-[9px] text-muted-foreground/50 -mt-2">
          Placeholders : {"{user}"} {"{inviter}"}
        </p>
      </div>

      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          détection & staff
        </p>

        <CyberInput
          label="seuil_faux_compte (jours)"
          type="number"
          value={String(c.invitesFakeAccountAgeDays ?? 7)}
          onChange={(v) => updateModuleConfig("invitesFakeAccountAgeDays", parseInt(v) || 7)}
          placeholder="7"
        />
        <p className="font-mono text-[9px] text-muted-foreground/50 -mt-2">
          Un compte créé il y a moins de X jours est marqué comme faux compte (n&apos;est pas compté dans le score).
        </p>

        <RoleSelect
          botId={botId}
          label="rôle_staff (ajouter/retirer/reset — sinon Gérer le serveur)"
          value={c.invitesStaffRoleId ?? ""}
          onChange={(v) => updateModuleConfig("invitesStaffRoleId", v)}
        />
      </div>

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

      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          <Trophy className="mr-1 inline size-3" />
          classement (top 20)
        </p>

        {loadingBoard ? (
          <p className="font-mono text-xs text-muted-foreground/50">Chargement...</p>
        ) : leaderboard.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground/50">Aucune invitation enregistrée.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-dashed">
            <table className="w-full text-left font-mono text-[10px]">
              <thead>
                <tr className="border-b border-dashed text-muted-foreground/60 uppercase tracking-widest">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Membre</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Réguliers</th>
                  <th className="px-3 py-2">Partis</th>
                  <th className="px-3 py-2">Faux</th>
                  <th className="px-3 py-2">Bonus</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, i) => (
                  <tr key={row.userId} className="border-b border-dashed last:border-0 hover:bg-muted/30 transition">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2">
                      <a
                        href={`https://discord.com/users/${row.userId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {row.userId}
                      </a>
                    </td>
                    <td className="px-3 py-2 font-bold">{row.score}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.regular}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.left}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.fake}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.bonus}</td>
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
