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
import { useParams } from "next/navigation";
import { ChannelSelect, RoleSelect } from "@/components/dashboard/discord-select";

export default function WelcomePage() {
  const params = useParams();
  const botId = params?.botId as string;
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
        <ChannelSelect
          botId={botId}
          label="channel_id"
          value={config.config.channelId ?? ""}
          onChange={(v) => updateModuleConfig("channelId", v)}
          filter="text"
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

        {/* Live preview */}
        {(() => {
          const replacePlaceholders = (text: string) =>
            text
              .replace(/\{username\}/g, "NouvelUtilisateur")
              .replace(/\{server\}/g, "Votre Serveur")
              .replace(/\{mention\}/g, "@NouvelUtilisateur")
              .replace(/\{memberCount\}/g, "1,234")
              .replace(/\{joinDate\}/g, new Date().toLocaleDateString("fr-FR"))
              .replace(/\{accountAge\}/g, "2 ans");

          const moduleConfig = config.config;
          const color = moduleConfig.embedColor;

          if (moduleConfig.useEmbed) {
            const resolvedTitle = moduleConfig.embedTitle
              ? replacePlaceholders(moduleConfig.embedTitle)
              : null;
            const resolvedDesc = moduleConfig.embedDescription
              ? replacePlaceholders(moduleConfig.embedDescription)
              : null;
            const resolvedFooter = moduleConfig.embedFooter
              ? replacePlaceholders(moduleConfig.embedFooter)
              : null;

            return (
              <div className="rounded-xl border border-dashed bg-card p-4">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-3">
                  aperçu_discord
                </p>
                <div
                  className="rounded-lg overflow-hidden"
                  style={{ borderLeft: `4px solid #${color || "5865F2"}` }}
                >
                  <div className="bg-[#2b2d31] p-3 space-y-2">
                    {moduleConfig.embedThumbnail && (
                      <div className="flex justify-end">
                        <div className="size-16 rounded-full bg-muted" />
                      </div>
                    )}
                    {resolvedTitle && (
                      <p className="font-semibold text-white text-sm">{resolvedTitle}</p>
                    )}
                    {resolvedDesc && (
                      <p className="text-[#dcddde] text-xs whitespace-pre-line">{resolvedDesc}</p>
                    )}
                    {resolvedFooter && (
                      <p className="text-[#a3a6aa] text-[10px] mt-2">{resolvedFooter}</p>
                    )}
                    {!resolvedTitle && !resolvedDesc && !resolvedFooter && (
                      <p className="text-[#a3a6aa] text-[10px] italic">Aucun contenu configuré</p>
                    )}
                  </div>
                </div>
              </div>
            );
          } else {
            const resolvedMessage = moduleConfig.message
              ? replacePlaceholders(moduleConfig.message)
              : null;

            return (
              <div className="rounded-xl border border-dashed bg-card p-4">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-3">
                  aperçu_discord
                </p>
                <div className="rounded-lg bg-[#2b2d31] p-3">
                  {resolvedMessage ? (
                    <p className="text-[#dcddde] text-xs">{resolvedMessage}</p>
                  ) : (
                    <p className="text-[#a3a6aa] text-[10px] italic">Aucun message configuré</p>
                  )}
                </div>
              </div>
            );
          }
        })()}
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">auto_role</p>
          {(config.config.autoRoleIds ?? []).map((roleId: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="font-mono text-xs text-foreground flex-1">@{roleId}</span>
              <button onClick={() => {
                const ids = [...(config.config.autoRoleIds ?? [])];
                ids.splice(i, 1);
                updateModuleConfig("autoRoleIds", ids);
              }} className="font-mono text-[10px] text-red-400 hover:text-red-300">×</button>
            </div>
          ))}
          <div className="flex gap-2">
            <div className="flex-1">
              <RoleSelect
                botId={botId}
                value=""
                onChange={(v) => {
                  if (!v) return;
                  const ids = [...(config.config.autoRoleIds ?? [])];
                  if (!ids.includes(v)) updateModuleConfig("autoRoleIds", [...ids, v]);
                }}
                label="Ajouter un rôle"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">image_de_bienvenue</p>
              <p className="font-mono text-[9px] text-muted-foreground/60">
                Image générée via api.popcat.xyz avec avatar + nom du serveur
              </p>
            </div>
            <Switch
              checked={config.config.useWelcomeImage ?? false}
              onCheckedChange={(v) => updateModuleConfig("useWelcomeImage", v)}
            />
          </div>
          {config.config.useWelcomeImage && (
            <CyberInput
              label="image_de_fond (url)"
              value={config.config.welcomeImageBackground ?? ""}
              onChange={(v) => updateModuleConfig("welcomeImageBackground", v)}
              placeholder="https://i.imgur.com/9Bi2OzJ.jpeg"
            />
          )}
        </div>

        <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">anti_raid</p>
              <p className="font-mono text-[9px] text-muted-foreground/60">
                Kick/ban/mute les comptes trop récents, lockdown si trop de joins
              </p>
            </div>
            <Switch
              checked={config.config.antiRaidEnabled ?? false}
              onCheckedChange={(v) => updateModuleConfig("antiRaidEnabled", v)}
              className="scale-75"
            />
          </div>
          {config.config.antiRaidEnabled && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <CyberInput
                  label="age_minimum (jours)"
                  value={String(config.config.antiRaidMinAccountAgeDays ?? 7)}
                  onChange={(v) => updateModuleConfig("antiRaidMinAccountAgeDays", parseInt(v) || 7)}
                  placeholder="7"
                />
                <div className="space-y-1">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">action</p>
                  <select
                    value={config.config.antiRaidAction ?? "kick"}
                    onChange={(e) => updateModuleConfig("antiRaidAction", e.target.value)}
                    className="w-full rounded-md border border-dashed bg-background px-2 py-1.5 font-mono text-xs text-foreground"
                  >
                    <option value="kick">kick</option>
                    <option value="ban">ban</option>
                    <option value="mute">mute (1h)</option>
                  </select>
                </div>
              </div>
              <CyberInput
                label="join_rate_limit (max joins / 10s, vide = désactivé)"
                value={config.config.antiRaidJoinRateLimit ? String(config.config.antiRaidJoinRateLimit) : ""}
                onChange={(v) => updateModuleConfig("antiRaidJoinRateLimit", v ? parseInt(v) || undefined : undefined)}
                placeholder="ex: 5"
              />
              <p className="font-mono text-[9px] text-muted-foreground/50">
                Si le rate limit est dépassé, le niveau de vérification du serveur passe en VERY_HIGH pendant 5 min.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">message_de_depart</p>
            <Switch
              checked={config.config.goodbyeEnabled ?? false}
              onCheckedChange={(v) => updateModuleConfig("goodbyeEnabled", v)}
            />
          </div>
          {config.config.goodbyeEnabled && (
            <>
              <ChannelSelect botId={botId} value={config.config.goodbyeChannelId ?? ""} onChange={(v) => updateModuleConfig("goodbyeChannelId", v)} label="salon_de_depart" filter="text" />
              <CyberInput label="message_de_depart" value={config.config.goodbyeMessage ?? ""} onChange={(v) => updateModuleConfig("goodbyeMessage", v)} placeholder="Au revoir {username} ! Placeholders: {username} {server} {memberCount}" />
            </>
          )}
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
