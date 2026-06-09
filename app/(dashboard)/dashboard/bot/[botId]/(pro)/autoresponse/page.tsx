"use client";

import { CyberInput, LoadingScreen, PageHeader } from "@/components/dashboard/cyber-ui";
import { Switch } from "@/components/ui/switch";
import { useBotConfig } from "@/hooks/use-bot-config";
import type { AutoResponse } from "@/components/dashboard/bot-types";
import {
  MessageSquareReply,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import { ChannelSelect, RoleSelect } from "@/components/dashboard/discord-select";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const TRIGGER_TYPES = [
  { value: "exact",      label: "Exact" },
  { value: "contains",   label: "Contient" },
  { value: "startswith", label: "Commence par" },
  { value: "endswith",   label: "Finit par" },
  { value: "regex",      label: "Regex" },
] as const;

const RESPONSE_TYPES = [
  { value: "text",     label: "Texte" },
  { value: "embed",    label: "Embed" },
  { value: "reaction", label: "Réaction emoji" },
] as const;

const VARS_HINT = "{user} {username} {server} {channel} {count}";

const DEFAULT_FORM = {
  trigger: "",
  triggerType: "contains" as AutoResponse["triggerType"],
  response: "",
  responseType: "text" as AutoResponse["responseType"],
  embedColor: "",
  embedTitle: "",
  caseSensitive: false,
  cooldownSeconds: 0,
  deleteOriginal: false,
  replyToUser: true,
  allowedChannelIds: [] as string[],
  ignoredRoleIds: [] as string[],
};

export default function AutoresponsePage() {
  const params = useParams();
  const botId = (params?.botId as string) ?? "";
  const { config } = useBotConfig();
  const { toast } = useToast();

  const [autoResponses, setAutoResponses] = useState<AutoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [adding, setAdding] = useState(false);

  const guildId = (config?.config as Record<string, string> | undefined)?.guildId ?? "";

  const load = useCallback(async () => {
    if (!botId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bot/autoresponse?botId=${botId}`);
      const data = await res.json();
      setAutoResponses(
        (data.autoResponses as AutoResponse[]).map((ar) => ({
          ...ar,
          allowedChannelIds: Array.isArray(ar.allowedChannelIds) ? ar.allowedChannelIds : [],
          ignoredRoleIds: Array.isArray(ar.ignoredRoleIds) ? ar.ignoredRoleIds : [],
        }))
      );
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les auto-réponses", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [botId, toast]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (ar: AutoResponse) => {
    const optimistic = autoResponses.map((r) =>
      r.id === ar.id ? { ...r, enabled: !r.enabled } : r
    );
    setAutoResponses(optimistic);
    try {
      await fetch("/api/bot/autoresponse", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ar.id, botId, enabled: !ar.enabled }),
      });
    } catch {
      setAutoResponses(autoResponses);
      toast({ title: "Erreur", description: "Impossible de mettre à jour", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    setAutoResponses((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`/api/bot/autoresponse?id=${id}&botId=${botId}`, { method: "DELETE" });
    } catch {
      load();
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  };

  const handleAdd = async () => {
    if (!form.trigger.trim() || !form.response.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/bot/autoresponse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId,
          guildId,
          ...form,
          embedColor: form.embedColor || null,
          embedTitle: form.embedTitle || null,
          allowedChannelIds: form.allowedChannelIds.length > 0 ? form.allowedChannelIds : null,
          ignoredRoleIds: form.ignoredRoleIds.length > 0 ? form.ignoredRoleIds : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast({ title: "Erreur", description: d.error, variant: "destructive" });
        return;
      }
      setForm(DEFAULT_FORM);
      await load();
      toast({ title: "Auto-réponse ajoutée" });
    } finally {
      setAdding(false);
    }
  };

  if (!config) return <LoadingScreen />;

  const totalTriggers = autoResponses.reduce((s, ar) => s + ar.triggerCount, 0);

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<MessageSquareReply className="size-4" />}
        title="Auto-Réponses"
        subtitle="Répond automatiquement aux messages selon des triggers configurables"
        status={config.status}
      />

      {/* Compteur total */}
      <div className="flex items-center gap-3 rounded-xl border border-dashed bg-card p-4">
        <Zap className="size-4 text-blue-400" />
        <span className="font-mono text-xs text-muted-foreground">
          <span className="font-bold text-foreground">{totalTriggers.toLocaleString()}</span> déclenchements au total
          {" · "}
          <span className="font-bold text-foreground">{autoResponses.length}</span> règle(s) configurée(s)
        </span>
      </div>

      {/* Liste des auto-réponses */}
      {!loading && autoResponses.length > 0 && (
        <div className="rounded-xl border border-dashed bg-card overflow-hidden">
          <p className="px-4 pt-3 pb-2 font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— règles actives —</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-dashed text-left font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 pb-2">Trigger</th>
                <th className="px-4 pb-2 hidden sm:table-cell">Type</th>
                <th className="px-4 pb-2 hidden md:table-cell">Réponse</th>
                <th className="px-4 pb-2 text-right hidden sm:table-cell">Décl.</th>
                <th className="px-4 pb-2 text-right">Actif</th>
                <th className="px-4 pb-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {autoResponses.map((ar) => (
                <tr key={ar.id} className="border-b border-dashed last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-mono max-w-[120px] truncate">
                    <code className="text-blue-400">{ar.trigger}</code>
                  </td>
                  <td className="px-4 py-2.5 hidden sm:table-cell text-muted-foreground">
                    {TRIGGER_TYPES.find((t) => t.value === ar.triggerType)?.label ?? ar.triggerType}
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground max-w-[160px] truncate">
                    {ar.response}
                  </td>
                  <td className="px-4 py-2.5 hidden sm:table-cell text-right font-mono text-muted-foreground">
                    {ar.triggerCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Switch
                      checked={ar.enabled}
                      onCheckedChange={() => handleToggle(ar)}
                      className="scale-75"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => handleDelete(ar.id)}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulaire d'ajout */}
      <div className="rounded-xl border border-dashed bg-card p-4 space-y-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— ajouter une règle —</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <CyberInput
            label="trigger"
            placeholder="ex: !aide, bonjour, ^help.*"
            value={form.trigger}
            onChange={(v) => setForm((f) => ({ ...f, trigger: v }))}
          />
          <div className="space-y-1">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Type de trigger</label>
            <Select
              value={form.triggerType}
              onValueChange={(v) => setForm((f) => ({ ...f, triggerType: v as AutoResponse["triggerType"] }))}
            >
              <SelectTrigger className="font-mono text-xs h-9 border-dashed bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="font-mono text-xs">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Réponse
            <span className="ml-2 text-muted-foreground/50 normal-case">(variables : {VARS_HINT})</span>
          </label>
          <Textarea
            placeholder="Tape ta réponse ici… Utilise {user} pour mentionner l'auteur."
            value={form.response}
            onChange={(e) => setForm((f) => ({ ...f, response: e.target.value }))}
            rows={3}
            className="font-mono text-xs border-dashed bg-background resize-none"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Type de réponse</label>
            <Select
              value={form.responseType}
              onValueChange={(v) => setForm((f) => ({ ...f, responseType: v as AutoResponse["responseType"] }))}
            >
              <SelectTrigger className="font-mono text-xs h-9 border-dashed bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESPONSE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="font-mono text-xs">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <CyberInput
            label="cooldown_secondes"
            type="number"
            placeholder="0"
            value={String(form.cooldownSeconds)}
            onChange={(v) => setForm((f) => ({ ...f, cooldownSeconds: parseInt(v) || 0 }))}
          />
        </div>

        {form.responseType === "embed" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <CyberInput
              label="titre_embed"
              placeholder="Titre de l'embed…"
              value={form.embedTitle}
              onChange={(v) => setForm((f) => ({ ...f, embedTitle: v }))}
            />
            <CyberInput
              label="couleur_embed"
              placeholder="#5865f2"
              value={form.embedColor}
              onChange={(v) => setForm((f) => ({ ...f, embedColor: v }))}
            />
          </div>
        )}

        {/* Restrictions optionnelles */}
        <div className="rounded-lg border border-dashed p-3 space-y-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">restrictions (optionnel)</p>

          <div className="space-y-1.5">
            <p className="font-mono text-[9px] text-muted-foreground/60">Salons autorisés (vide = tous les salons)</p>
            <div className="flex flex-wrap gap-1.5">
              {form.allowedChannelIds.map((id) => (
                <span key={id} className="flex items-center gap-1 rounded border border-dashed bg-background px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                  {id}
                  <button type="button" onClick={() => setForm((f) => ({ ...f, allowedChannelIds: f.allowedChannelIds.filter((c) => c !== id) }))} className="hover:text-red-400">✕</button>
                </span>
              ))}
            </div>
            <ChannelSelect
              botId={botId}
              label="ajouter_salon_autorisé"
              value=""
              onChange={(v) => { if (v && !form.allowedChannelIds.includes(v)) setForm((f) => ({ ...f, allowedChannelIds: [...f.allowedChannelIds, v] })); }}
              filter="text"
            />
          </div>

          <div className="space-y-1.5">
            <p className="font-mono text-[9px] text-muted-foreground/60">Rôles ignorés (vide = personne ignoré)</p>
            <div className="flex flex-wrap gap-1.5">
              {form.ignoredRoleIds.map((id) => (
                <span key={id} className="flex items-center gap-1 rounded border border-dashed bg-background px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                  {id}
                  <button type="button" onClick={() => setForm((f) => ({ ...f, ignoredRoleIds: f.ignoredRoleIds.filter((r) => r !== id) }))} className="hover:text-red-400">✕</button>
                </span>
              ))}
            </div>
            <RoleSelect
              botId={botId}
              label="ajouter_rôle_ignoré"
              value=""
              onChange={(v) => { if (v && !form.ignoredRoleIds.includes(v)) setForm((f) => ({ ...f, ignoredRoleIds: [...f.ignoredRoleIds, v] })); }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch
              checked={form.caseSensitive}
              onCheckedChange={(v) => setForm((f) => ({ ...f, caseSensitive: v }))}
              className="scale-75"
            />
            <span className="font-mono text-xs text-muted-foreground">Sensible à la casse</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch
              checked={form.deleteOriginal}
              onCheckedChange={(v) => setForm((f) => ({ ...f, deleteOriginal: v }))}
              className="scale-75"
            />
            <span className="font-mono text-xs text-muted-foreground">Supprimer le message original</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch
              checked={form.replyToUser}
              onCheckedChange={(v) => setForm((f) => ({ ...f, replyToUser: v }))}
              className="scale-75"
            />
            <span className="font-mono text-xs text-muted-foreground">Répondre en mention</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAdd}
            disabled={adding || !form.trigger.trim() || !form.response.trim()}
            className="flex items-center gap-2 rounded-lg border border-dashed px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            <Plus className="size-3.5" />
            {adding ? "ajout…" : "add_rule"}
          </button>
        </div>
      </div>
    </div>
  );
}
