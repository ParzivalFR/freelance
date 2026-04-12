"use client";

import { MessageSquare, Save } from "lucide-react";
import {
  CyberInput,
  CyberTextarea,
  PageHeader,
  PlaceholderRef,
  LoadingScreen,
} from "@/components/dashboard/cyber-ui";
import { Switch } from "@/components/ui/switch";
import { useBotConfig } from "@/hooks/use-bot-config";

export default function WelcomePage() {
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();

  if (!config) return <LoadingScreen />;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<MessageSquare className="size-4" />}
        title="Welcome"
        subtitle="Messages de bienvenue personnalisés"
        status={config.status}
      />

      <div className="space-y-3">
        <CyberInput
          label="channel_id"
          value={config.config.channelId ?? ""}
          onChange={(v) => updateModuleConfig("channelId", v)}
          placeholder="123456789012345678"
        />

        <PlaceholderRef />

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="font-mono text-[10px] text-foreground">mode embed</p>
            <p className="font-mono text-[9px] text-muted-foreground/60">
              Message enrichi avec image, couleur, footer
            </p>
          </div>
          <Switch
            checked={config.config.useEmbed ?? false}
            onCheckedChange={(v) => updateModuleConfig("useEmbed", v)}
            className="scale-75"
          />
        </div>

        {config.config.useEmbed ? (
          <div className="space-y-2.5 rounded-lg border border-dashed p-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">
              — embed —
            </p>
            <CyberInput
              label="titre"
              value={config.config.embedTitle ?? ""}
              onChange={(v) => updateModuleConfig("embedTitle", v)}
              placeholder="Bienvenue sur {server} !"
            />
            <CyberTextarea
              label="description"
              value={config.config.embedDescription ?? ""}
              onChange={(v) => updateModuleConfig("embedDescription", v)}
              placeholder={"Bienvenue {mention} !\n\n• Tu es le **{memberCount}e** membre\n• Compte créé il y a {accountAge}"}
            />
            <div className="grid grid-cols-2 gap-2">
              <CyberInput
                label="couleur (hex sans #)"
                value={config.config.embedColor ?? ""}
                onChange={(v) => updateModuleConfig("embedColor", v)}
                placeholder="5865F2"
              />
              <CyberInput
                label="footer"
                value={config.config.embedFooter ?? ""}
                onChange={(v) => updateModuleConfig("embedFooter", v)}
                placeholder="Mon serveur"
              />
            </div>
            <CyberInput
              label="image (url)"
              value={config.config.embedImage ?? ""}
              onChange={(v) => updateModuleConfig("embedImage", v)}
              placeholder="https://..."
            />
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-mono text-[10px] text-foreground">avatar en thumbnail</p>
                <p className="font-mono text-[9px] text-muted-foreground/60">
                  Affiche la photo de profil du membre
                </p>
              </div>
              <Switch
                checked={config.config.embedThumbnail ?? false}
                onCheckedChange={(v) => updateModuleConfig("embedThumbnail", v)}
                className="scale-75"
              />
            </div>
          </div>
        ) : (
          <CyberInput
            label="message"
            value={config.config.message ?? ""}
            onChange={(v) => updateModuleConfig("message", v)}
            placeholder="Bienvenue {username} sur {server} !"
          />
        )}

        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500">
            ▶ aperçu des placeholders
          </p>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
            {[
              ["{mention}", "@Gaël"],
              ["{username}", "Gaël"],
              ["{server}", "Mon Serveur"],
              ["{memberCount}", "142"],
              ["{joinDate}", "31/03/2026"],
              ["{accountAge}", "3 ans"],
            ].map(([ph, ex]) => (
              <div key={ph} className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-blue-400">{ph}</span>
                <span className="font-mono text-[9px] text-muted-foreground/50">→ {ex}</span>
              </div>
            ))}
          </div>
        </div>
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
