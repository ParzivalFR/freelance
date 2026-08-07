"use client";

import { Save, ShieldAlert } from "lucide-react";
import { CyberInput, PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useParams } from "next/navigation";
import { ChannelSelect, RoleSelect } from "@/components/dashboard/discord-select";
import { Switch } from "@/components/ui/switch";

const ACTIONS = [
  { value: "strip_roles", label: "Retirer tous ses rôles (recommandé)" },
  { value: "kick", label: "Expulser du serveur" },
  { value: "ban", label: "Bannir du serveur" },
];

export default function AntinukePage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();

  if (!config) return <LoadingScreen />;

  const c = config.config;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<ShieldAlert className="size-4" />}
        title="Anti-Nuke"
        subtitle="Détecte et bloque un compte (même admin) qui supprime des salons/rôles ou bannit en masse"
        status={config.status}
      />

      <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">activer</p>
          <Switch
            checked={c.antinukeEnabled ?? false}
            onCheckedChange={(v) => updateModuleConfig("antinukeEnabled", v)}
          />
        </div>
        <p className="font-mono text-[9px] text-muted-foreground/50">
          Nécessite que le bot ait la permission &quot;Voir les journaux d&apos;audit&quot; sur le serveur.
        </p>
      </div>

      {c.antinukeEnabled && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <CyberInput
              label="seuil_actions"
              type="text"
              value={String(c.antinukeMaxActions ?? "")}
              onChange={(v) => updateModuleConfig("antinukeMaxActions", v ? Math.max(1, Number(v)) : undefined)}
              placeholder="3"
            />
            <CyberInput
              label="fenetre_secondes"
              type="text"
              value={String(c.antinukeWindowSeconds ?? "")}
              onChange={(v) => updateModuleConfig("antinukeWindowSeconds", v ? Math.max(1, Number(v)) : undefined)}
              placeholder="10"
            />
          </div>
          <p className="font-mono text-[9px] text-muted-foreground/50 -mt-2">
            Ex : 3 actions en 10s → suppressions de salons/rôles ou bannissements déclenchent la sanction.
          </p>

          <div className="space-y-1.5">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">sanction</p>
            <select
              value={c.antinukeAction ?? "strip_roles"}
              onChange={(e) => updateModuleConfig("antinukeAction", e.target.value)}
              className="w-full rounded-lg border border-dashed bg-background py-2.5 px-3 font-mono text-sm text-foreground outline-hidden transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10"
            >
              {ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>

          <RoleSelect
            botId={botId}
            label="rôle_de_confiance (optionnel)"
            value={c.antinukeWhitelistRoleId ?? ""}
            onChange={(v) => updateModuleConfig("antinukeWhitelistRoleId", v)}
          />
          <p className="font-mono text-[9px] text-muted-foreground/50 -mt-2">
            Les membres avec ce rôle ne seront jamais sanctionnés (ex : co-fondateurs, staff de confiance).
          </p>

          <ChannelSelect
            botId={botId}
            label="salon_de_logs (optionnel)"
            value={c.antinukeLogChannelId ?? ""}
            onChange={(v) => updateModuleConfig("antinukeLogChannelId", v)}
            filter="text"
          />
        </>
      )}

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
    </div>
  );
}
