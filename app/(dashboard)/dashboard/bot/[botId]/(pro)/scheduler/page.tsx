"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, Plus, Trash2, Pencil, X, Check, RefreshCw } from "lucide-react";
import { PageHeader, LoadingScreen, CyberTextarea } from "@/components/dashboard/cyber-ui";
import { ChannelSelect } from "@/components/dashboard/discord-select";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

interface ScheduledMessage {
  id: string;
  channelId: string;
  content: string;
  cronExpression: string | null;
  nextRun: string | null;
  isRecurring: boolean;
  enabled: boolean;
}

const RECURRENCE_OPTIONS = [
  { value: "once", label: "Une seule fois (date précise)" },
  { value: "daily", label: "Tous les jours" },
  { value: "weekly", label: "Toutes les semaines" },
  { value: "monthly", label: "Tous les mois" },
];

interface FormState {
  channelId: string;
  content: string;
  recurrence: string;
  date: string; // YYYY-MM-DDTHH:mm (input datetime-local)
}

const EMPTY_FORM: FormState = { channelId: "", content: "", recurrence: "once", date: "" };

function toWhen(form: FormState): string {
  if (form.recurrence !== "once") return form.recurrence;
  // Le input datetime-local est en heure locale du navigateur : on le convertit
  // en ISO absolu ici plutôt que d'envoyer une chaîne ambiguë que le serveur
  // (VPS, souvent en UTC) interpréterait dans son propre fuseau.
  return new Date(form.date).toISOString();
}

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatWhen(m: ScheduledMessage): string {
  if (m.isRecurring) {
    const label = RECURRENCE_OPTIONS.find((o) => o.value === m.cronExpression)?.label ?? m.cronExpression;
    return `🔁 ${label}`;
  }
  if (!m.nextRun) return "—";
  return new Date(m.nextRun).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export default function SchedulerPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config } = useBotConfig();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ScheduledMessage[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/bot/scheduler?botId=${botId}`);
    if (res.ok) setMessages(await res.json());
  }

  useEffect(() => {
    if (botId) load();
  }, [botId]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(m: ScheduledMessage) {
    setForm({
      channelId: m.channelId,
      content: m.content,
      recurrence: m.isRecurring ? (m.cronExpression ?? "daily") : "once",
      date: m.nextRun ? toLocalInputValue(m.nextRun) : "",
    });
    setEditingId(m.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function submit() {
    if (!form.channelId || !form.content.trim()) {
      toast({ title: "Champs manquants", description: "Choisis un salon et écris un message.", variant: "destructive" });
      return;
    }
    if (form.recurrence === "once" && !form.date) {
      toast({ title: "Date manquante", description: "Choisis une date pour un envoi unique.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const when = toWhen(form);
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch("/api/bot/scheduler", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId ?? undefined,
          botId,
          channelId: form.channelId,
          content: form.content,
          when,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error ?? "Impossible d'enregistrer.", variant: "destructive" });
        return;
      }
      toast({ title: editingId ? "Message modifié" : "Message programmé créé" });
      closeForm();
      load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/bot/scheduler?id=${id}&botId=${botId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      toast({ title: "Erreur", description: data.error ?? "Suppression impossible.", variant: "destructive" });
      return;
    }
    setMessages((prev) => prev?.filter((m) => m.id !== id) ?? null);
    toast({ title: "Message supprimé" });
  }

  async function toggleEnabled(m: ScheduledMessage) {
    const res = await fetch("/api/bot/scheduler", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: m.id, botId, enabled: !m.enabled }),
    });
    if (!res.ok) return;
    setMessages((prev) => prev?.map((x) => (x.id === m.id ? { ...x, enabled: !x.enabled } : x)) ?? null);
  }

  if (!config || messages === null) return <LoadingScreen />;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Clock className="size-4" />}
        title="Messages programmés"
        subtitle="Planifie l'envoi automatique de messages, ponctuels ou récurrents"
        status={config.status}
      />

      <div className="space-y-4">
        {messages.length === 0 && !showForm && (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="font-mono text-xs text-muted-foreground">Aucun message programmé.</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className="rounded-xl border border-dashed bg-card p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
                  <span>#{m.channelId}</span> · {formatWhen(m)}
                </p>
                <p className="mt-1 whitespace-pre-wrap font-mono text-xs text-foreground">{m.content}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={m.enabled} onCheckedChange={() => toggleEnabled(m)} />
                <button onClick={() => openEdit(m)} className="text-muted-foreground hover:text-foreground">
                  <Pencil className="size-3.5" />
                </button>
                <button onClick={() => remove(m.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {showForm && (
          <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">
                — {editingId ? "modifier" : "nouveau"} message programmé —
              </p>
              <button onClick={closeForm} className="text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
              </button>
            </div>

            <ChannelSelect
              botId={botId}
              label="salon cible"
              value={form.channelId}
              onChange={(v) => setForm((f) => ({ ...f, channelId: v }))}
              filter="text"
            />

            <CyberTextarea
              label="message"
              value={form.content}
              onChange={(v) => setForm((f) => ({ ...f, content: v }))}
              placeholder="Ton message ici… (mise en forme, mentions de rôles/salons)"
              botId={botId}
              rows={4}
            />

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">récurrence</p>
                <select
                  value={form.recurrence}
                  onChange={(e) => setForm((f) => ({ ...f, recurrence: e.target.value }))}
                  className="w-full rounded-md border border-dashed bg-background px-2 py-1.5 font-mono text-xs text-foreground"
                >
                  {RECURRENCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
                  {form.recurrence === "once" ? "date d'envoi" : "premier envoi"}
                </p>
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full rounded-md border border-dashed bg-background px-2 py-1.5 font-mono text-xs text-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={closeForm} className="font-mono text-xs text-muted-foreground hover:text-foreground">
                annuler
              </button>
              <button
                onClick={submit}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg border border-dashed px-4 py-1.5 font-mono text-xs font-bold text-blue-400 hover:bg-blue-500/10 disabled:opacity-40"
              >
                {saving ? <RefreshCw className="size-3 animate-spin" /> : <Check className="size-3" />}
                {editingId ? "enregistrer" : "créer"}
              </button>
            </div>
          </div>
        )}

        {!showForm && (
          <button
            onClick={openCreate}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 font-mono text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <Plus className="size-3.5" />
            Programmer un message
          </button>
        )}
      </div>

      <div className="rounded-xl border border-dashed bg-card p-4 space-y-1">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">aussi disponible en commande</p>
        <p className="font-mono text-[10px] text-muted-foreground/70">
          /schedule add|list|delete (réservé au staff — permission &quot;Gérer le serveur&quot;)
        </p>
      </div>
    </div>
  );
}
