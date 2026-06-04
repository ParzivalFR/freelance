"use client";

import { MousePointerClick, Plus, Trash2, Save, Send } from "lucide-react";
import { PageHeader, CyberInput, CyberTextarea, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { RoleSelect } from "@/components/dashboard/discord-select";
import { useParams } from "next/navigation";
import { useState } from "react";
import type { RRPanel, RRButton } from "@/components/dashboard/bot-types";
import { useToast } from "@/components/ui/use-toast";

const EMPTY_PANEL: Omit<RRPanel, "id"> = {
  channelId: "",
  title: "",
  description: "",
  color: "",
  mode: "toggle",
  buttons: [],
};

export default function ReactionRolesPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config, updateModuleConfig, save, saving, saved } = useBotConfig();
  const { toast } = useToast();

  const [newPanel, setNewPanel] = useState<Omit<RRPanel, "id">>(EMPTY_PANEL);
  const [showForm, setShowForm] = useState(false);
  const [postingId, setPostingId] = useState<string | null>(null);

  const panels: RRPanel[] = (config?.config?.reactionRoles as RRPanel[] | undefined) ?? [];

  if (!config) return <LoadingScreen />;

  function addPanel() {
    if (!newPanel.title.trim()) return;
    const panel: RRPanel = {
      id: Math.random().toString(36).slice(2, 10),
      ...newPanel,
    };
    updateModuleConfig("reactionRoles", [...panels, panel]);
    setNewPanel(EMPTY_PANEL);
    setShowForm(false);
    toast({ title: "Panel créé", description: "N'oublie pas de sauvegarder." });
  }

  function deletePanel(id: string) {
    updateModuleConfig(
      "reactionRoles",
      panels.filter((p) => p.id !== id)
    );
  }

  function addButton(panelId: string, btn: RRButton) {
    updateModuleConfig(
      "reactionRoles",
      panels.map((p) =>
        p.id === panelId ? { ...p, buttons: [...p.buttons, btn] } : p
      )
    );
  }

  function removeButton(panelId: string, idx: number) {
    updateModuleConfig(
      "reactionRoles",
      panels.map((p) =>
        p.id === panelId
          ? { ...p, buttons: p.buttons.filter((_, i) => i !== idx) }
          : p
      )
    );
  }

  async function postPanel(panelId: string) {
    setPostingId(panelId);
    try {
      const res = await fetch("/api/bot/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, workerCommand: `RR_POST_${panelId}` }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      toast({ title: "Commande envoyée", description: `Le panel sera posté sur Discord.` });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'envoyer la commande.", variant: "destructive" });
    } finally {
      setPostingId(null);
    }
  }

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<MousePointerClick className="size-4" />}
        title="Reaction Roles"
        subtitle="Panels avec boutons pour auto-assigner des rôles"
        status={config.status}
      />

      <div className="space-y-4">
        {panels.length === 0 && !showForm && (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="font-mono text-xs text-muted-foreground">Aucun panel configuré.</p>
          </div>
        )}

        {panels.map((panel) => (
          <PanelCard
            key={panel.id}
            panel={panel}
            botId={botId}
            onDelete={() => deletePanel(panel.id)}
            onAddButton={(btn) => addButton(panel.id, btn)}
            onRemoveButton={(idx) => removeButton(panel.id, idx)}
            onPost={() => postPanel(panel.id)}
            posting={postingId === panel.id}
          />
        ))}

        {showForm && (
          <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— nouveau panel —</p>
            <CyberInput
              label="titre"
              value={newPanel.title}
              onChange={(v) => setNewPanel((p) => ({ ...p, title: v }))}
              placeholder="Choisir tes rôles"
            />
            <CyberTextarea
              label="description (optionnel)"
              value={newPanel.description ?? ""}
              onChange={(v) => setNewPanel((p) => ({ ...p, description: v }))}
              placeholder="Clique sur un bouton pour obtenir le rôle correspondant."
            />
            <div className="grid grid-cols-2 gap-2">
              <CyberInput
                label="couleur (hex sans #)"
                value={newPanel.color ?? ""}
                onChange={(v) => setNewPanel((p) => ({ ...p, color: v }))}
                placeholder="5865F2"
              />
              <div className="space-y-1">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">mode</p>
                <select
                  value={newPanel.mode}
                  onChange={(e) =>
                    setNewPanel((p) => ({ ...p, mode: e.target.value as RRPanel["mode"] }))
                  }
                  className="w-full rounded-md border border-dashed bg-background px-2 py-1.5 font-mono text-xs text-foreground"
                >
                  <option value="toggle">toggle (add/remove)</option>
                  <option value="unique">unique (1 seul du groupe)</option>
                  <option value="verify">verify (confirmation)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="font-mono text-xs text-muted-foreground hover:text-foreground"
              >
                annuler
              </button>
              <button
                onClick={addPanel}
                disabled={!newPanel.title.trim()}
                className="flex items-center gap-1.5 rounded-lg border border-dashed px-4 py-1.5 font-mono text-xs font-bold text-blue-400 hover:bg-blue-500/10 disabled:opacity-40"
              >
                <Plus className="size-3" /> créer
              </button>
            </div>
          </div>
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 font-mono text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <Plus className="size-3.5" />
            Créer un panel
          </button>
        )}
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

// ─── PanelCard ────────────────────────────────────────────────────────────────

function PanelCard({
  panel,
  botId,
  onDelete,
  onAddButton,
  onRemoveButton,
  onPost,
  posting,
}: {
  panel: RRPanel;
  botId: string;
  onDelete: () => void;
  onAddButton: (btn: RRButton) => void;
  onRemoveButton: (idx: number) => void;
  onPost: () => void;
  posting: boolean;
}) {
  const [newBtn, setNewBtn] = useState<RRButton>({ roleId: "", label: "", emoji: "", style: "secondary" });

  function handleAdd() {
    if (!newBtn.roleId || !newBtn.label.trim()) return;
    onAddButton({ ...newBtn, emoji: newBtn.emoji || undefined });
    setNewBtn({ roleId: "", label: "", emoji: "", style: "secondary" });
  }

  const COLOR_MAP: Record<string, string> = {
    primary: "bg-blue-500",
    secondary: "bg-zinc-600",
    success: "bg-green-600",
    danger: "bg-red-600",
  };

  return (
    <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs font-bold text-foreground">{panel.title}</p>
          <p className="font-mono text-[9px] text-muted-foreground/60">
            id: {panel.id} · mode: {panel.mode}
            {panel.messageId ? ` · posté` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPost}
            disabled={posting}
            className="flex items-center gap-1 rounded border border-dashed px-2.5 py-1 font-mono text-[10px] text-blue-400 hover:bg-blue-500/10 disabled:opacity-40"
          >
            <Send className="size-3" />
            {posting ? "envoi…" : "poster"}
          </button>
          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {panel.buttons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {panel.buttons.map((btn, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className={`rounded px-2 py-0.5 font-mono text-[10px] text-white ${COLOR_MAP[btn.style ?? "secondary"] ?? "bg-zinc-600"}`}
              >
                {btn.emoji ? `${btn.emoji} ` : ""}{btn.label}
              </span>
              <button onClick={() => onRemoveButton(i)} className="text-red-400/60 hover:text-red-400 text-xs">×</button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-dashed p-3 space-y-2">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">+ ajouter un bouton</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <RoleSelect
              botId={botId}
              value={newBtn.roleId}
              onChange={(v) => setNewBtn((b) => ({ ...b, roleId: v }))}
              label="rôle"
            />
          </div>
          <CyberInput
            label="label"
            value={newBtn.label}
            onChange={(v) => setNewBtn((b) => ({ ...b, label: v }))}
            placeholder="@Gamer"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <CyberInput
            label="emoji (optionnel)"
            value={newBtn.emoji ?? ""}
            onChange={(v) => setNewBtn((b) => ({ ...b, emoji: v }))}
            placeholder="🎮"
          />
          <div className="space-y-1">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">style</p>
            <select
              value={newBtn.style ?? "secondary"}
              onChange={(e) => setNewBtn((b) => ({ ...b, style: e.target.value as RRButton["style"] }))}
              className="w-full rounded-md border border-dashed bg-background px-2 py-1.5 font-mono text-xs text-foreground"
            >
              <option value="primary">primary (bleu)</option>
              <option value="secondary">secondary (gris)</option>
              <option value="success">success (vert)</option>
              <option value="danger">danger (rouge)</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={!newBtn.roleId || !newBtn.label.trim()}
          className="flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1 font-mono text-[10px] text-blue-400 hover:bg-blue-500/10 disabled:opacity-40"
        >
          <Plus className="size-3" /> ajouter le bouton
        </button>
      </div>
    </div>
  );
}
