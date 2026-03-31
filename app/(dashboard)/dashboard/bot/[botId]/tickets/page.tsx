"use client";

import { Ticket, Save } from "lucide-react";
import type { TicketCategory } from "@/components/dashboard/bot-types";
import {
  CyberInput,
  CyberTextarea,
  ModuleToggle,
  PageHeader,
  LoadingScreen,
} from "@/components/dashboard/cyber-ui";
import { Switch } from "@/components/ui/switch";
import { useBotConfig } from "@/hooks/use-bot-config";

export default function TicketsPage() {
  const { config, saving, saved, update, updateModuleConfig, save } = useBotConfig();

  if (!config) return <LoadingScreen />;

  const categories: TicketCategory[] = (config.config.categories as TicketCategory[]) ?? [
    { id: "support", label: "Support", emoji: "🎫", description: "Aide générale" },
    { id: "bug", label: "Bug Report", emoji: "🐛", description: "Signaler un problème" },
  ];

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Ticket className="size-4" />}
        title="Tickets"
        subtitle="Système de support avancé"
        status={config.status}
      />

      <ModuleToggle
        icon={<Ticket className="size-3.5" />}
        label="tickets"
        description="Tickets avec catégories, claim, rating et transcripts"
        enabled={config.moduleTickets}
        onToggle={() => update("moduleTickets", !config.moduleTickets)}
      >
        {/* Salons */}
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">
          — salons —
        </p>
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

        {/* Panel */}
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">
          — panel —
        </p>
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
            label="panel_color (hex sans #)"
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

        {/* Catégories */}
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">
          — catégories —
        </p>
        <div className="space-y-2">
          {categories.map((cat, i) => (
            <div key={i} className="rounded-lg border border-dashed p-2 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <input
                  value={cat.emoji}
                  onChange={(e) => {
                    const cats = [...categories];
                    cats[i] = { ...cats[i], emoji: e.target.value };
                    updateModuleConfig("categories", cats);
                  }}
                  className="w-9 shrink-0 rounded border border-dashed bg-background px-1 py-1 text-center font-mono text-sm outline-hidden focus:border-blue-500/50"
                  placeholder="🎫"
                />
                <input
                  value={cat.label}
                  onChange={(e) => {
                    const cats = [...categories];
                    cats[i] = { ...cats[i], label: e.target.value };
                    updateModuleConfig("categories", cats);
                  }}
                  className="min-w-0 flex-1 rounded border border-dashed bg-background px-2 py-1 font-mono text-xs text-foreground outline-hidden focus:border-blue-500/50"
                  placeholder="Support"
                />
                <button
                  type="button"
                  onClick={() => {
                    const cats = categories.filter((_, j) => j !== i);
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
                  const cats = [...categories];
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
              const cats: TicketCategory[] = [
                ...categories,
                { id: `cat_${Date.now()}`, label: "Nouvelle catégorie", emoji: "📝", description: "" },
              ];
              updateModuleConfig("categories", cats);
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 transition hover:border-blue-500/30 hover:text-blue-400"
          >
            + ajouter une catégorie
          </button>
        </div>

        {/* Options */}
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">
          — options —
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
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
          <div className="flex items-center justify-between">
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

        {/* Deploy hint */}
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
