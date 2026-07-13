"use client";

import { Save, ShieldCheck } from "lucide-react";
import {
  CyberInput,
  PageHeader,
  LoadingScreen,
} from "@/components/dashboard/cyber-ui";
import { Switch } from "@/components/ui/switch";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useParams } from "next/navigation";
import { ChannelSelect, RoleSelect } from "@/components/dashboard/discord-select";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export default function VerificationPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();
  const { toast } = useToast();
  const [postingPanel, setPostingPanel] = useState(false);

  if (!config) return <LoadingScreen />;

  const postPanel = async () => {
    if (!config.config.verificationChannelId) {
      toast({ title: "Salon manquant", description: "Configure le salon du panel avant de le poster.", variant: "destructive" });
      return;
    }
    setPostingPanel(true);
    try {
      const res = await fetch("/api/bot/verification/post-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error ?? "Impossible de poster le panel.", variant: "destructive" });
        return;
      }
      toast({ title: "Panel posté ✅", description: "Le panel de vérification a été posté dans le salon configuré." });
    } finally {
      setPostingPanel(false);
    }
  };

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<ShieldCheck className="size-4" />}
        title="Vérification"
        subtitle="Panel de vérification avec acceptation des règles"
        status={config.status}
      />

      <div className="space-y-3">
        <RoleSelect
          botId={botId}
          label="role_non_verifie"
          value={config.config.verificationUnverifiedRoleId ?? ""}
          onChange={(v) => updateModuleConfig("verificationUnverifiedRoleId", v)}
        />

        <RoleSelect
          botId={botId}
          label="role_verifie"
          value={config.config.verificationVerifiedRoleId ?? ""}
          onChange={(v) => updateModuleConfig("verificationVerifiedRoleId", v)}
        />

        <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">embed</p>
          <CyberInput
            label="titre"
            value={config.config.verificationEmbedTitle ?? ""}
            onChange={(v) => updateModuleConfig("verificationEmbedTitle", v)}
            placeholder="Vérification"
          />
          <CyberInput
            label="description"
            value={config.config.verificationEmbedDescription ?? ""}
            onChange={(v) => updateModuleConfig("verificationEmbedDescription", v)}
            placeholder="Clique sur le bouton ci-dessous pour accepter les règles et accéder au serveur."
          />
          <div className="grid grid-cols-2 gap-2">
            <CyberInput
              label="couleur (hex sans #)"
              value={config.config.verificationEmbedColor ?? ""}
              onChange={(v) => updateModuleConfig("verificationEmbedColor", v)}
              placeholder="5865F2"
            />
            <CyberInput
              label="image (url)"
              value={config.config.verificationEmbedImage ?? ""}
              onChange={(v) => updateModuleConfig("verificationEmbedImage", v)}
              placeholder="https://..."
            />
          </div>
          <CyberInput
            label="label du bouton"
            value={config.config.verificationButtonLabel ?? ""}
            onChange={(v) => updateModuleConfig("verificationButtonLabel", v)}
            placeholder="✅ J'accepte les règles"
          />
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="font-mono text-[10px] text-foreground">mode_captcha</p>
            <p className="font-mono text-[9px] text-muted-foreground/60">
              Génère un code 4 chiffres à recopier avant validation
            </p>
          </div>
          <Switch
            checked={config.config.verificationCaptchaMode ?? false}
            onCheckedChange={(v) => updateModuleConfig("verificationCaptchaMode", v)}
            className="scale-75"
          />
        </div>

        <ChannelSelect
          botId={botId}
          label="salon_du_panel"
          value={config.config.verificationChannelId ?? ""}
          onChange={(v) => updateModuleConfig("verificationChannelId", v)}
          filter="text"
        />

        <ChannelSelect
          botId={botId}
          label="salon_de_logs"
          value={config.config.verificationLogChannelId ?? ""}
          onChange={(v) => updateModuleConfig("verificationLogChannelId", v)}
          filter="text"
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={postPanel}
          disabled={postingPanel}
          className="flex items-center gap-2 rounded-lg border border-dashed border-blue-500/40 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-blue-400 transition hover:bg-blue-500/10 hover:text-blue-300 disabled:opacity-40"
        >
          <ShieldCheck className="size-3.5" />
          {postingPanel ? "posting..." : "poster_le_panel"}
        </button>

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
