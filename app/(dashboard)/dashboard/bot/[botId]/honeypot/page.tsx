"use client";

import { useState } from "react";
import { Bug, Save, Send } from "lucide-react";
import {
  CyberInput,
  CyberTextarea,
  PageHeader,
  LoadingScreen,
} from "@/components/dashboard/cyber-ui";
import { Switch } from "@/components/ui/switch";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useParams } from "next/navigation";
import { ChannelSelect, RoleSelect } from "@/components/dashboard/discord-select";
import { toast } from "sonner";

const DEFAULT_COLOR = "393a41";

export default function HoneypotPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();
  const [publishing, setPublishing] = useState(false);

  if (!config) return <LoadingScreen />;

  const c = config.config;
  const exemptRoleIds = c.honeypotExemptRoleIds ?? [];
  const colorHex = (c.honeypotEmbedColor || DEFAULT_COLOR).replace("#", "");
  const previewColor = `#${colorHex}`;
  const counter = c.honeypotCounter ?? 0;

  const publishEmbed = async () => {
    if (!c.honeypotChannelId) {
      toast.error("Sélectionne d'abord un salon-piège, puis enregistre.");
      return;
    }
    setPublishing(true);
    try {
      // On enregistre d'abord pour être sûr que le salon est en DB
      const saveRes = await save();
      if (!saveRes.ok) {
        toast.error(saveRes.error ?? "Erreur lors de l'enregistrement");
        return;
      }
      const res = await fetch(`/api/bot/${botId}/honeypot/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur lors de la publication");
        return;
      }
      toast.success("Embed d'avertissement publié dans le salon-piège !");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Bug className="size-4" />}
        title="Honeypot"
        subtitle="Salon-piège anti-spam : tout message y déclenche un softban automatique"
        status={config.status}
      />

      {/* Compteur */}
      <div className="flex items-center gap-3 rounded-xl border border-dashed bg-card p-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
          <Bug className="size-5" />
        </div>
        <div>
          <p className="font-mono text-2xl font-bold text-foreground">{counter}</p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
            compte(s) piégé(s) au total
          </p>
        </div>
      </div>

      {/* Salon-piège */}
      <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— salon-piège —</p>
        <ChannelSelect
          botId={botId}
          label="channel_id"
          value={c.honeypotChannelId ?? ""}
          onChange={(v) => updateModuleConfig("honeypotChannelId", v)}
          filter="text"
        />
        <p className="font-mono text-[9px] text-muted-foreground/50">
          ⚠️ Cache ce salon aux membres humains (visible uniquement pour piéger les bots de spam). Les admins et rôles exemptés ne sont jamais sanctionnés.
        </p>
      </div>

      {/* Rôles exemptés */}
      <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">roles_exemptes</p>
        <p className="font-mono text-[9px] text-muted-foreground/50">
          Les administrateurs sont toujours exemptés automatiquement.
        </p>
        {exemptRoleIds.map((roleId: string, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex-1 font-mono text-xs text-foreground">@{roleId}</span>
            <button
              onClick={() => {
                const ids = [...exemptRoleIds];
                ids.splice(i, 1);
                updateModuleConfig("honeypotExemptRoleIds", ids);
              }}
              className="font-mono text-[10px] text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        ))}
        <RoleSelect
          botId={botId}
          value=""
          onChange={(v) => {
            if (!v) return;
            if (!exemptRoleIds.includes(v)) updateModuleConfig("honeypotExemptRoleIds", [...exemptRoleIds, v]);
          }}
          label="Ajouter un rôle exempté"
        />
      </div>

      {/* Options */}
      <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— options —</p>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="font-mono text-[10px] text-foreground">MP de prévention</p>
            <p className="font-mono text-[9px] text-muted-foreground/60">
              Envoie un message privé à l'utilisateur avant le ban (sécurise ton compte, tu peux revenir)
            </p>
          </div>
          <Switch
            checked={c.honeypotDmEnabled !== false}
            onCheckedChange={(v) => updateModuleConfig("honeypotDmEnabled", v)}
            className="scale-75"
          />
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="font-mono text-[10px] text-foreground">Restaurer les rôles au retour</p>
            <p className="font-mono text-[9px] text-muted-foreground/60">
              Si un compte piégé re-rejoint, ses rôles d'avant lui sont rendus automatiquement (backup 30j)
            </p>
          </div>
          <Switch
            checked={c.honeypotRestoreRoles ?? false}
            onCheckedChange={(v) => updateModuleConfig("honeypotRestoreRoles", v)}
            className="scale-75"
          />
        </div>

        <CyberInput
          label="purge_messages (heures)"
          value={String(c.honeypotDeleteMessageHours ?? 1)}
          onChange={(v) => updateModuleConfig("honeypotDeleteMessageHours", Math.min(168, Math.max(0, parseFloat(v) || 1)))}
          placeholder="1"
        />
        <p className="font-mono text-[9px] text-muted-foreground/50">
          Supprime les messages postés par l'utilisateur sur cette période. Max 168h (7 jours).
        </p>
      </div>

      {/* Embed d'avertissement */}
      <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— embed d'avertissement —</p>
        <CyberInput
          label="titre"
          value={c.honeypotEmbedTitle ?? ""}
          onChange={(v) => updateModuleConfig("honeypotEmbedTitle", v)}
          placeholder="🍯 Salon piège — ne postez rien ici"
        />
        <CyberTextarea
          label="description"
          value={c.honeypotEmbedDescription ?? ""}
          onChange={(v) => updateModuleConfig("honeypotEmbedDescription", v)}
          placeholder={"N'envoyez aucun message ici — bannissement automatique."}
        />
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              couleur (hex sans #)
            </p>
            <div className="flex items-center gap-2">
              <div className="size-7 shrink-0 rounded border border-dashed" style={{ backgroundColor: previewColor }} />
              <input
                type="text"
                value={c.honeypotEmbedColor ?? ""}
                onChange={(e) => updateModuleConfig("honeypotEmbedColor", e.target.value.replace("#", ""))}
                placeholder={DEFAULT_COLOR}
                maxLength={6}
                className="w-full rounded-lg border border-dashed bg-background py-2.5 pl-3 pr-3 font-mono text-sm text-foreground placeholder-muted-foreground/40 outline-hidden transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10"
              />
            </div>
          </div>
          <CyberInput
            label="footer"
            value={c.honeypotEmbedFooter ?? ""}
            onChange={(v) => updateModuleConfig("honeypotEmbedFooter", v)}
            placeholder="Mon serveur • Honeypot"
          />
        </div>

        {/* Aperçu */}
        <div className="rounded-lg bg-[#313338] p-3">
          <div className="rounded overflow-hidden" style={{ borderLeft: `4px solid ${previewColor}` }}>
            <div className="bg-[#2b2d31] p-3 space-y-1.5">
              <p className="text-[#b5bac1] text-[10px]">Système de protection anti-spam</p>
              <p className="font-semibold text-white text-sm">
                {c.honeypotEmbedTitle?.trim() || "🍯 Salon piège — ne postez rien ici"}
              </p>
              <p className="text-[#dcddde] text-xs whitespace-pre-line">
                {c.honeypotEmbedDescription?.trim() ||
                  "N'envoyez aucun message dans ce salon. Tout message posté ici entraîne un bannissement automatique (softban)."}
              </p>
              <div className="flex gap-6 pt-1">
                <div>
                  <p className="text-white text-[10px] font-semibold">⚙️ Action</p>
                  <p className="text-[#dcddde] text-[10px]">Softban automatique</p>
                </div>
                <div>
                  <p className="text-white text-[10px] font-semibold">🛡️ Comptes piégés</p>
                  <p className="text-[#dcddde] text-[10px]">{counter}</p>
                </div>
              </div>
              <p className="text-[#a3a6aa] text-[10px] pt-1 border-t border-white/5">
                {c.honeypotEmbedFooter?.trim() || `${config.name} • Honeypot`}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={publishEmbed}
          disabled={publishing || !c.honeypotChannelId}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition hover:border-blue-500/30 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="size-3.5" />
          {publishing ? "publication..." : "publier l'embed dans le salon-piège"}
        </button>
      </div>

      <div className="flex justify-end">
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
