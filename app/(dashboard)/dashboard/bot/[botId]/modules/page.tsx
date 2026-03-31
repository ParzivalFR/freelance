"use client";

import { Activity, BarChart2, MessageSquare, Puzzle, Save, ScrollText, Shield, Star, Ticket } from "lucide-react";
import type { LevelReward } from "@/components/dashboard/bot-types";
import { FaDiscord } from "react-icons/fa";
import { Switch } from "@/components/ui/switch";
import {
  CyberInput,
  CyberTextarea,
  ModuleToggle,
  PageHeader,
  PlaceholderRef,
  LoadingScreen,
} from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";

export default function BotModulesPage() {
  const { config, saving, saved, update, updateModuleConfig, save } = useBotConfig();

  if (!config) return <LoadingScreen />;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Puzzle className="size-4" />}
        title="Modules"
        subtitle="Configuration des fonctionnalités"
        status={config.status}
      />

      <div className="space-y-3">

        {/* ── Monitor ── */}
        <ModuleToggle
          icon={<Activity className="size-3.5" />}
          label="monitor"
          description="Surveillance de disponibilité (HTTP / TCP / PING)"
          enabled={config.moduleMonitor}
          onToggle={() => update("moduleMonitor", !config.moduleMonitor)}
        >
          <CyberInput
            label="salon_alerte_par_défaut"
            value={config.config.monitorAlertChannelId ?? ""}
            onChange={(v) => updateModuleConfig("monitorAlertChannelId", v)}
            placeholder="ID du salon Discord pour les alertes"
          />
          <CyberInput
            label="rôle_à_mentionner (optionnel)"
            value={config.config.monitorAlertRoleId ?? ""}
            onChange={(v) => updateModuleConfig("monitorAlertRoleId", v)}
            placeholder="ID du rôle à mentionner lors d'un incident"
          />
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500">
              ▶ gérer les monitors
            </p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              Gérez vos monitors depuis l&apos;onglet &quot;Monitor&quot; dans la sidebar.
            </p>
          </div>
        </ModuleToggle>

        {/* ── Welcome ── */}
        <ModuleToggle
          icon={<MessageSquare className="size-3.5" />}
          label="welcome"
          description="Messages de bienvenue"
          enabled={config.moduleWelcome}
          onToggle={() => update("moduleWelcome", !config.moduleWelcome)}
        >
          <CyberInput
            label="channel_id"
            value={config.config.channelId ?? ""}
            onChange={(v) => updateModuleConfig("channelId", v)}
            placeholder="123456789012345678"
          />

          <PlaceholderRef />

          <div className="flex items-center justify-between py-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              mode_embed
            </span>
            <Switch
              checked={config.config.useEmbed ?? false}
              onCheckedChange={(v) => updateModuleConfig("useEmbed", v)}
              className="scale-75"
            />
          </div>

          {config.config.useEmbed ? (
            <div className="space-y-2.5 rounded-lg border border-dashed p-3">
              <CyberInput
                label="embed_title"
                value={config.config.embedTitle ?? ""}
                onChange={(v) => updateModuleConfig("embedTitle", v)}
                placeholder="Bienvenue sur {server} !"
              />
              <CyberTextarea
                label="embed_description"
                value={config.config.embedDescription ?? ""}
                onChange={(v) => updateModuleConfig("embedDescription", v)}
                placeholder={"Bienvenue {mention} !\n\n• Tu es le **{memberCount}e** membre\n• Compte créé il y a {accountAge}"}
              />
              <div className="grid grid-cols-2 gap-2">
                <CyberInput
                  label="embed_color (hex)"
                  value={config.config.embedColor ?? ""}
                  onChange={(v) => updateModuleConfig("embedColor", v)}
                  placeholder="5865F2"
                />
                <CyberInput
                  label="embed_footer"
                  value={config.config.embedFooter ?? ""}
                  onChange={(v) => updateModuleConfig("embedFooter", v)}
                  placeholder="Mon serveur"
                />
              </div>
              <CyberInput
                label="embed_image (url)"
                value={config.config.embedImage ?? ""}
                onChange={(v) => updateModuleConfig("embedImage", v)}
                placeholder="https://..."
              />
              <div className="flex items-center justify-between py-1">
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  avatar_thumbnail
                </span>
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
        </ModuleToggle>

        {/* ── Modération ── */}
        <ModuleToggle
          icon={<Shield className="size-3.5" />}
          label="moderation"
          description="/ban /kick /warn /timeout + AutoMod"
          enabled={config.moduleModeration}
          onToggle={() => update("moduleModeration", !config.moduleModeration)}
        >
          <CyberInput
            label="log_channel_id"
            value={config.config.logChannelId ?? ""}
            onChange={(v) => updateModuleConfig("logChannelId", v)}
            placeholder="ID du salon de logs"
          />

          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">
            — seuils warns automatiques —
          </p>
          <p className="font-mono text-[9px] text-muted-foreground/50">
            Laisser vide pour désactiver le seuil
          </p>
          <div className="grid grid-cols-2 gap-2">
            <CyberInput
              label="timeout_à (nb warns)"
              value={String(config.config.warnThresholdTimeout ?? "")}
              onChange={(v) => updateModuleConfig("warnThresholdTimeout", v ? Number(v) : "" as unknown as string)}
              placeholder="ex: 3"
            />
            <CyberInput
              label="durée timeout (min)"
              value={String(config.config.warnThresholdTimeoutDuration ?? "")}
              onChange={(v) => updateModuleConfig("warnThresholdTimeoutDuration", v ? Number(v) : "" as unknown as string)}
              placeholder="ex: 60"
            />
            <CyberInput
              label="kick_à (nb warns)"
              value={String(config.config.warnThresholdKick ?? "")}
              onChange={(v) => updateModuleConfig("warnThresholdKick", v ? Number(v) : "" as unknown as string)}
              placeholder="ex: 5"
            />
            <CyberInput
              label="ban_à (nb warns)"
              value={String(config.config.warnThresholdBan ?? "")}
              onChange={(v) => updateModuleConfig("warnThresholdBan", v ? Number(v) : "" as unknown as string)}
              placeholder="ex: 7"
            />
          </div>

          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">
            — auto-modération —
          </p>
          <div className="flex items-center justify-between py-0.5">
            <div>
              <p className="font-mono text-[10px] text-foreground">activer l&apos;automod</p>
              <p className="font-mono text-[9px] text-muted-foreground/60">
                Modération automatique des messages
              </p>
            </div>
            <Switch
              checked={config.config.automodEnabled ?? false}
              onCheckedChange={(v) => updateModuleConfig("automodEnabled", v)}
              className="scale-75"
            />
          </div>

          {config.config.automodEnabled && (
            <div className="space-y-3 rounded-lg border border-dashed p-3">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                détections
              </p>
              {([
                ["automodAntiSpam", "anti-spam", ">5 msgs en 5 secondes"],
                ["automodAntiDuplicate", "anti-doublon", "Même message 2x de suite"],
                ["automodAntiLinks", "anti-liens", "Bloquer les URLs"],
                ["automodAntiMentionSpam", "anti-mention spam", ">5 mentions en un message"],
                ["automodAntiCaps", "anti-majuscules", ">70% de caps sur >10 chars"],
              ] as const).map(([key, label, desc]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] text-foreground">{label}</p>
                    <p className="font-mono text-[9px] text-muted-foreground/50">{desc}</p>
                  </div>
                  <Switch
                    checked={(config.config[key] as boolean) ?? false}
                    onCheckedChange={(v) => updateModuleConfig(key, v)}
                    className="scale-75"
                  />
                </div>
              ))}

              <CyberInput
                label="mots_interdits (séparés par virgule)"
                value={config.config.automodBadWords ?? ""}
                onChange={(v) => updateModuleConfig("automodBadWords", v)}
                placeholder="insulte1, insulte2, ..."
              />

              {config.config.automodAntiLinks && (
                <CyberInput
                  label="domaines_autorisés (séparés par virgule)"
                  value={config.config.automodAllowedDomains ?? ""}
                  onChange={(v) => updateModuleConfig("automodAllowedDomains", v)}
                  placeholder="discord.com, youtube.com, ..."
                />
              )}

              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                action appliquée
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {(["warn", "timeout", "kick", "ban"] as const).map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => updateModuleConfig("automodAction", action)}
                    className={`rounded-lg border py-1.5 font-mono text-[10px] uppercase tracking-widest transition ${
                      (config.config.automodAction ?? "warn") === action
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                        : "border-dashed text-muted-foreground hover:border-blue-500/20 hover:text-muted-foreground"
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>

              {(config.config.automodAction === "timeout" || !config.config.automodAction) && (
                <CyberInput
                  label="durée_timeout (minutes)"
                  value={String(config.config.automodActionDuration ?? "")}
                  onChange={(v) => updateModuleConfig("automodActionDuration", v ? Number(v) : "" as unknown as string)}
                  placeholder="ex: 10"
                />
              )}
            </div>
          )}
        </ModuleToggle>

        {/* ── Tickets ── */}
        <ModuleToggle
          icon={<Ticket className="size-3.5" />}
          label="tickets"
          description="Système de tickets avancé"
          enabled={config.moduleTickets}
          onToggle={() => update("moduleTickets", !config.moduleTickets)}
        >
          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— salons —</p>
          <CyberInput
            label="discord_category_id"
            value={config.config.categoryId ?? ""}
            onChange={(v) => updateModuleConfig("categoryId", v)}
            placeholder="ID catégorie Discord (où créer les salons)"
          />
          <CyberInput
            label="log_channel_id"
            value={config.config.logChannelId ?? ""}
            onChange={(v) => updateModuleConfig("logChannelId", v)}
            placeholder="ID salon de logs (transcripts, fermetures)"
          />
          <CyberInput
            label="staff_role_id"
            value={config.config.staffRoleId ?? ""}
            onChange={(v) => updateModuleConfig("staffRoleId", v)}
            placeholder="ID rôle staff"
          />

          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— panel —</p>
          <CyberInput
            label="panel_title"
            value={config.config.panelTitle ?? ""}
            onChange={(v) => updateModuleConfig("panelTitle", v)}
            placeholder="🎫 Système de Tickets"
          />
          <CyberTextarea
            label="panel_description"
            value={config.config.panelDescription ?? ""}
            onChange={(v) => updateModuleConfig("panelDescription", v)}
            placeholder={"Besoin d'aide ? Ouvre un ticket !\n\n**Sélectionne une catégorie ↓**"}
            rows={3}
          />
          <div className="grid grid-cols-2 gap-2">
            <CyberInput
              label="panel_color (hex)"
              value={config.config.panelColor ?? ""}
              onChange={(v) => updateModuleConfig("panelColor", v)}
              placeholder="5865F2"
            />
            <CyberInput
              label="panel_image (url)"
              value={config.config.panelImage ?? ""}
              onChange={(v) => updateModuleConfig("panelImage", v)}
              placeholder="https://..."
            />
          </div>

          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— catégories —</p>
          <div className="space-y-2">
            {(config.config.categories ?? [
              { id: "support", label: "Support", emoji: "🎫", description: "Aide générale" },
              { id: "bug", label: "Bug Report", emoji: "🐛", description: "Signaler un problème" },
            ]).map((cat, i) => (
              <div key={i} className="rounded-lg border border-dashed p-2 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <input
                    value={cat.emoji}
                    onChange={(e) => {
                      const cats = [...(config.config.categories ?? [])];
                      cats[i] = { ...cats[i], emoji: e.target.value };
                      updateModuleConfig("categories", cats);
                    }}
                    className="w-9 shrink-0 rounded border border-dashed bg-background px-1 py-1 text-center font-mono text-sm outline-hidden focus:border-blue-500/50"
                    placeholder="🎫"
                  />
                  <input
                    value={cat.label}
                    onChange={(e) => {
                      const cats = [...(config.config.categories ?? [])];
                      cats[i] = { ...cats[i], label: e.target.value };
                      updateModuleConfig("categories", cats);
                    }}
                    className="min-w-0 flex-1 rounded border border-dashed bg-background px-2 py-1 font-mono text-xs text-foreground outline-hidden focus:border-blue-500/50"
                    placeholder="Support"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cats = (config.config.categories ?? []).filter((_, j) => j !== i);
                      updateModuleConfig("categories", cats);
                    }}
                    className="shrink-0 text-muted-foreground/40 transition hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
                <input
                  value={cat.description ?? ""}
                  onChange={(e) => {
                    const cats = [...(config.config.categories ?? [])];
                    cats[i] = { ...cats[i], description: e.target.value };
                    updateModuleConfig("categories", cats);
                  }}
                  className="w-full rounded border border-dashed bg-background px-2 py-1 font-mono text-xs text-muted-foreground outline-hidden focus:border-blue-500/50"
                  placeholder="Description affichée dans le select menu"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const cats = [
                  ...(config.config.categories ?? []),
                  { id: `cat_${Date.now()}`, label: "Nouvelle catégorie", emoji: "📝", description: "" },
                ];
                updateModuleConfig("categories", cats);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 transition hover:border-blue-500/30 hover:text-blue-400"
            >
              + ajouter une catégorie
            </button>
          </div>

          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— options —</p>
          <div className="flex items-center justify-between py-0.5">
            <div>
              <p className="font-mono text-[10px] text-foreground">notation après fermeture</p>
              <p className="font-mono text-[9px] text-muted-foreground/60">Le membre note le support 1-5 ⭐</p>
            </div>
            <Switch
              checked={config.config.enableRating ?? true}
              onCheckedChange={(v) => updateModuleConfig("enableRating", v)}
              className="scale-75"
            />
          </div>
          <div className="flex items-center justify-between py-0.5">
            <div>
              <p className="font-mono text-[10px] text-foreground">système de claim</p>
              <p className="font-mono text-[9px] text-muted-foreground/60">Le staff peut prendre en charge un ticket</p>
            </div>
            <Switch
              checked={config.config.enableClaim ?? true}
              onCheckedChange={(v) => updateModuleConfig("enableClaim", v)}
              className="scale-75"
            />
          </div>

          <CyberInput
            label="open_message"
            value={config.config.openMessage ?? ""}
            onChange={(v) => updateModuleConfig("openMessage", v)}
            placeholder="Bienvenue {user} ! Ton ticket sur '{subject}' a bien été créé."
          />
          <p className="font-mono text-[9px] text-muted-foreground/50">
            Placeholders : {"{user}"} {"{subject}"}
          </p>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500">▶ déployer le panel</p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              Une fois le bot en ligne, tape dans le bon salon Discord :
            </p>
            <p className="mt-1 rounded border border-dashed px-2 py-1 font-mono text-[11px] text-blue-400">
              /ticket panel
            </p>
          </div>
        </ModuleToggle>

        {/* ── XP / Levels ── */}
        <ModuleToggle
          icon={<Star className="size-3.5" />}
          label="xp & levels"
          description="/rank /leaderboard · Rôles par niveau"
          enabled={config.moduleLevel}
          onToggle={() => update("moduleLevel", !config.moduleLevel)}
        >
          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— gain d&apos;xp —</p>
          <div className="grid grid-cols-2 gap-2">
            <CyberInput
              label="xp_par_message"
              value={String(config.config.xpPerMessage ?? 20)}
              onChange={(v) => updateModuleConfig("xpPerMessage", v ? Number(v) : 20 as unknown as string)}
              placeholder="20"
            />
            <CyberInput
              label="cooldown (secondes)"
              value={String(config.config.xpCooldown ?? 60)}
              onChange={(v) => updateModuleConfig("xpCooldown", v ? Number(v) : 60 as unknown as string)}
              placeholder="60"
            />
          </div>
          <CyberInput
            label="multiplicateur_xp"
            value={String(config.config.xpMultiplier ?? 1)}
            onChange={(v) => updateModuleConfig("xpMultiplier", v ? Number(v) : 1 as unknown as string)}
            placeholder="1"
          />
          <p className="font-mono text-[9px] text-muted-foreground/50">
            XP gagné = (base ± 5) × multiplicateur — formule style MEE6
          </p>

          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— annonces level up —</p>
          <CyberInput
            label="salon_annonce (id, vide = même salon)"
            value={config.config.levelAnnounceChannel ?? ""}
            onChange={(v) => updateModuleConfig("levelAnnounceChannel", v)}
            placeholder="ID du salon d'annonce"
          />
          <CyberInput
            label="message_level_up"
            value={config.config.levelAnnounceMessage ?? ""}
            onChange={(v) => updateModuleConfig("levelAnnounceMessage", v)}
            placeholder="🎉 Félicitations {user}, tu passes au **niveau {level}** !"
          />
          <p className="font-mono text-[9px] text-muted-foreground/50">Placeholders : {"{user}"} {"{level}"}</p>

          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— exclusions —</p>
          <CyberInput
            label="rôles_sans_xp (ids séparés par virgule)"
            value={config.config.levelNoXpRoles ?? ""}
            onChange={(v) => updateModuleConfig("levelNoXpRoles", v)}
            placeholder="ID rôle 1, ID rôle 2, ..."
          />
          <CyberInput
            label="salons_sans_xp (ids séparés par virgule)"
            value={config.config.levelNoXpChannels ?? ""}
            onChange={(v) => updateModuleConfig("levelNoXpChannels", v)}
            placeholder="ID salon 1, ID salon 2, ..."
          />

          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— récompenses (rôles par niveau) —</p>
          <div className="space-y-2">
            {(config.config.levelRewards ?? []).map((reward, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-16 shrink-0">
                  <input
                    type="number"
                    value={reward.level}
                    min={1}
                    onChange={(e) => {
                      const rewards = [...(config.config.levelRewards ?? [])];
                      rewards[i] = { ...rewards[i], level: Number(e.target.value) };
                      updateModuleConfig("levelRewards", rewards);
                    }}
                    className="w-full rounded border border-dashed bg-background px-2 py-1 font-mono text-xs text-foreground outline-hidden focus:border-blue-500/50"
                    placeholder="niv."
                  />
                </div>
                <input
                  value={reward.roleId}
                  onChange={(e) => {
                    const rewards = [...(config.config.levelRewards ?? [])];
                    rewards[i] = { ...rewards[i], roleId: e.target.value };
                    updateModuleConfig("levelRewards", rewards);
                  }}
                  className="min-w-0 flex-1 rounded border border-dashed bg-background px-2 py-1 font-mono text-xs text-foreground outline-hidden focus:border-blue-500/50"
                  placeholder="ID du rôle Discord"
                />
                <button
                  type="button"
                  onClick={() => {
                    const rewards = (config.config.levelRewards ?? []).filter((_, j) => j !== i);
                    updateModuleConfig("levelRewards", rewards);
                  }}
                  className="shrink-0 text-muted-foreground/40 transition hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const rewards: LevelReward[] = [...(config.config.levelRewards ?? []), { level: 1, roleId: "" }];
                updateModuleConfig("levelRewards", rewards);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 transition hover:border-blue-500/30 hover:text-blue-400"
            >
              + ajouter une récompense
            </button>
          </div>

          <div className="flex items-center justify-between py-0.5">
            <div>
              <p className="font-mono text-[10px] text-foreground">cumuler les rôles</p>
              <p className="font-mono text-[9px] text-muted-foreground/60">Garder les anciens rôles en montant de niveau</p>
            </div>
            <Switch
              checked={config.config.levelStackRoles ?? false}
              onCheckedChange={(v) => updateModuleConfig("levelStackRoles", v)}
              className="scale-75"
            />
          </div>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500">▶ commandes disponibles</p>
            <div className="mt-2 space-y-1">
              {[
                ["/rank [membre]", "Carte de rang avec barre de progression"],
                ["/leaderboard", "Top 10 membres les plus actifs"],
                ["/givexp <membre> <xp>", "Donner de l'XP (admin)"],
                ["/setxp <membre> <xp>", "Définir l'XP exacte (admin)"],
                ["/resetxp <membre>", "Remettre à zéro (admin)"],
              ].map(([cmd, desc]) => (
                <div key={cmd} className="flex items-start gap-2">
                  <span className="shrink-0 rounded border border-dashed px-1.5 py-0.5 font-mono text-[10px] text-blue-400">{cmd}</span>
                  <span className="font-mono text-[9px] text-muted-foreground/60">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </ModuleToggle>

        {/* ── Logs ── */}
        <ModuleToggle
          icon={<ScrollText className="size-3.5" />}
          label="logs"
          description="Logs centralisés et configurables de tous les événements"
          enabled={config.moduleLog}
          onToggle={() => update("moduleLog", !config.moduleLog)}
        >
          {/* Salons */}
          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— salons —</p>
          <CyberInput
            label="salon_par_défaut (fallback)"
            value={config.config.logsChannelId ?? ""}
            onChange={(v) => updateModuleConfig("logsChannelId", v)}
            placeholder="ID salon utilisé si aucun salon spécifique"
          />
          <div className="grid grid-cols-2 gap-2">
            <CyberInput
              label="salon_membres"
              value={config.config.logsChannelMembers ?? ""}
              onChange={(v) => updateModuleConfig("logsChannelMembers", v)}
              placeholder="join / leave"
            />
            <CyberInput
              label="salon_modération"
              value={config.config.logsChannelModeration ?? ""}
              onChange={(v) => updateModuleConfig("logsChannelModeration", v)}
              placeholder="ban / kick / warn..."
            />
            <CyberInput
              label="salon_tickets"
              value={config.config.logsChannelTickets ?? ""}
              onChange={(v) => updateModuleConfig("logsChannelTickets", v)}
              placeholder="ouverture / fermeture"
            />
            <CyberInput
              label="salon_niveaux"
              value={config.config.logsChannelLevels ?? ""}
              onChange={(v) => updateModuleConfig("logsChannelLevels", v)}
              placeholder="level up"
            />
            <CyberInput
              label="salon_discord_natif"
              value={config.config.logsChannelDiscord ?? ""}
              onChange={(v) => updateModuleConfig("logsChannelDiscord", v)}
              placeholder="msgs, vocal, rôles, salons..."
            />
          </div>

          {/* Couleurs */}
          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— couleurs d&apos;embed —</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              ["logsColorMembers",    "couleur_membres",         "22c55e"],
              ["logsColorModeration", "couleur_modération",      "ef4444"],
              ["logsColorTickets",    "couleur_tickets",         "3b82f6"],
              ["logsColorLevels",     "couleur_niveaux",         "f59e0b"],
              ["logsColorDiscord",    "couleur_discord_natif",   "5865f2"],
            ] as const).map(([key, label, placeholder]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="size-6 shrink-0 rounded border border-dashed"
                  style={{ backgroundColor: `#${config.config[key] || placeholder}` }}
                />
                <CyberInput
                  label={label}
                  value={config.config[key] ?? ""}
                  onChange={(v) => updateModuleConfig(key, v)}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
          <p className="font-mono text-[9px] text-muted-foreground/50">Hex sans # — ex: ef4444</p>

          {/* Mentions */}
          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— mentions —</p>
          <CyberInput
            label="mention_role_id"
            value={config.config.logsMentionRoleId ?? ""}
            onChange={(v) => updateModuleConfig("logsMentionRoleId", v)}
            placeholder="ID du rôle à mentionner (staff, admin...)"
          />
          <p className="font-mono text-[9px] text-muted-foreground/50">
            Par défaut : mention sur ban, kick et automod. Personnalisable ci-dessous.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {([
              "moderation.ban", "moderation.kick", "moderation.automod",
              "moderation.warn", "moderation.timeout", "ticket.create",
            ] as const).map((evt) => {
              const active = !(config.config.logsMentionOnEvents?.length
                ? !config.config.logsMentionOnEvents.includes(evt)
                : !["moderation.ban", "moderation.kick", "moderation.automod"].includes(evt));
              return (
                <button
                  key={evt}
                  type="button"
                  onClick={() => {
                    const current: string[] = config.config.logsMentionOnEvents?.length
                      ? [...config.config.logsMentionOnEvents]
                      : ["moderation.ban", "moderation.kick", "moderation.automod"];
                    const next = current.includes(evt)
                      ? current.filter((e) => e !== evt)
                      : [...current, evt];
                    updateModuleConfig("logsMentionOnEvents", next);
                  }}
                  className={`rounded border px-2 py-0.5 font-mono text-[9px] transition ${
                    active
                      ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                      : "border-dashed text-muted-foreground/40 hover:border-blue-500/20"
                  }`}
                >
                  {evt}
                </button>
              );
            })}
          </div>

          {/* Filtrage */}
          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— filtrage des événements —</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {([
              ["member.join",               "📥 member.join"],
              ["member.leave",              "📤 member.leave"],
              ["moderation.ban",            "🔨 moderation.ban"],
              ["moderation.unban",          "✅ moderation.unban"],
              ["moderation.kick",           "👢 moderation.kick"],
              ["moderation.warn",           "⚠️ moderation.warn"],
              ["moderation.unwarn",         "✅ moderation.unwarn"],
              ["moderation.timeout",        "🔇 moderation.timeout"],
              ["moderation.untimeout",      "🔊 moderation.untimeout"],
              ["moderation.clear",          "🗑️ moderation.clear"],
              ["moderation.automod",        "🤖 moderation.automod"],
              ["ticket.create",             "🎫 ticket.create"],
              ["ticket.close",              "🔒 ticket.close"],
              ["levels.levelup",            "⬆️ levels.levelup"],
              ["discord.message.delete",    "🗑️ msg.delete"],
              ["discord.message.edit",      "✏️ msg.edit"],
              ["discord.message.bulk",      "🗑️ msg.bulk"],
              ["discord.voice.join",        "🔊 voice.join"],
              ["discord.voice.leave",       "🔇 voice.leave"],
              ["discord.voice.move",        "🔀 voice.move"],
              ["discord.channel.create",    "📁 channel.create"],
              ["discord.channel.delete",    "📁 channel.delete"],
              ["discord.channel.update",    "📝 channel.update"],
              ["discord.role.create",       "🎭 role.create"],
              ["discord.role.delete",       "🎭 role.delete"],
              ["discord.role.update",       "🎭 role.update"],
              ["discord.member.update",     "👤 member.update"],
              ["discord.invite.create",     "🔗 invite.create"],
              ["discord.invite.delete",     "🔗 invite.delete"],
            ] as const).map(([evt, label]) => {
              const disabled = config.config.logsDisabledEvents?.includes(evt) ?? false;
              return (
                <div key={evt} className="flex items-center justify-between">
                  <span className={`font-mono text-[9px] ${disabled ? "text-muted-foreground/30 line-through" : "text-foreground"}`}>
                    {label}
                  </span>
                  <Switch
                    checked={!disabled}
                    onCheckedChange={(checked) => {
                      const current = config.config.logsDisabledEvents ?? [];
                      const next = checked
                        ? current.filter((e) => e !== evt)
                        : [...current, evt];
                      updateModuleConfig("logsDisabledEvents", next);
                    }}
                    className="scale-75"
                  />
                </div>
              );
            })}
          </div>
        </ModuleToggle>

        {/* ── Survey ── */}
        <ModuleToggle
          icon={<BarChart2 className="size-3.5" />}
          label="survey"
          description="Sondages avancés (choix multiple, classé, pondéré)"
          enabled={config.moduleSurvey}
          onToggle={() => update("moduleSurvey", !config.moduleSurvey)}
        >
          <CyberInput
            label="poll_channel_id (défaut)"
            value={config.config.pollChannelId ?? ""}
            onChange={(v) => updateModuleConfig("pollChannelId", v)}
            placeholder="123456789012345678"
          />
          <CyberInput
            label="poll_manager_role_id"
            value={config.config.pollManagerRoleId ?? ""}
            onChange={(v) => updateModuleConfig("pollManagerRoleId", v)}
            placeholder="vide = tout le monde peut créer"
          />
          <PlaceholderRef />
          <div className="rounded-lg border border-dashed p-2">
            <p className="font-mono text-[8px] text-muted-foreground/40">
              Commandes disponibles : /poll, /quickpoll, /poll-end, /poll-results
            </p>
            <p className="mt-0.5 font-mono text-[8px] text-muted-foreground/30">
              Gérez vos sondages depuis l&apos;onglet &quot;Sondages&quot; dans la sidebar.
            </p>
          </div>
        </ModuleToggle>

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
