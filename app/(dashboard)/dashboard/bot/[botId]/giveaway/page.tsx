"use client";

import { LoadingScreen, PageHeader, CyberInput } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Check, Copy, Gift, Pencil, Plus, RotateCcw, Save, Square, Trash2, Trophy, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type GiveawayMode = "RANDOM" | "WEIGHTED" | "FIRST";
type GiveawayStatus = "PENDING" | "ACTIVE" | "ENDED" | "CANCELLED";

type Giveaway = {
  id: string;
  title: string;
  prize: string;
  description: string | null;
  channelId: string;
  guildId: string;
  mode: GiveawayMode;
  winnerCount: number;
  status: GiveawayStatus;
  endAt: string;
  startAt: string | null;
  winnerIds: string[] | null;
  participantCount: number;
  requiredRoleIds: string[] | null;
  minLevel: number | null;
  mustBeBooster: boolean;
  minDaysOnServer: number | null;
  useEmbed: boolean;
  embedColor: string | null;
  embedImage: string | null;
};

const MODE_LABELS: Record<GiveawayMode, { label: string; desc: string; color: string }> = {
  RANDOM:   { label: "Aléatoire",  desc: "Tirage au sort classique",              color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  WEIGHTED: { label: "Pondéré",    desc: "Plus t'as de XP, plus t'as de chances", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  FIRST:    { label: "Premier",    desc: "Les X premiers à participer gagnent",    color: "text-green-400 bg-green-500/10 border-green-500/20" },
};

const STATUS_LABELS: Record<GiveawayStatus, { label: string; color: string }> = {
  PENDING:   { label: "En attente",  color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  ACTIVE:    { label: "En cours",    color: "text-green-400 bg-green-500/10 border-green-500/20" },
  ENDED:     { label: "Terminé",     color: "text-muted-foreground bg-muted/40 border-border" },
  CANCELLED: { label: "Annulé",      color: "text-red-400 bg-red-500/10 border-red-500/20" },
};

function nextRoundedTime() {
  const now = new Date();
  const m = now.getMinutes();
  const rounded = ALL_MINUTES.find(mm => Number(mm) > m) ?? "00";
  const h = rounded === "00"
    ? String((now.getHours() + 1) % 24).padStart(2, "0")
    : String(now.getHours()).padStart(2, "0");
  return `${h}:${rounded}`;
}

const makeDefaultForm = (channelId = "") => ({
  channelId,
  title: "",
  prize: "",
  description: "",
  mode: "RANDOM" as GiveawayMode,
  winnerCount: 1,
  endDate: undefined as Date | undefined,
  endTime: "20:00",
  startDate: undefined as Date | undefined,
  startTime: "12:00",
  requiredRoleIds: "",
  minLevel: "",
  mustBeBooster: false,
  minDaysOnServer: "",
  useEmbed: true,
  embedColor: "7158ff",
  embedImage: "",
});

// ── Date picker combiné Calendar + time input ─────────────────────────────────

const ALL_HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const ALL_MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

function isToday(date: Date) {
  const now = new Date();
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
}

function DateTimePicker({
  label,
  date,
  time,
  onDateChange,
  onTimeChange,
  required,
}: {
  label: string;
  date: Date | undefined;
  time: string;
  onDateChange: (d: Date | undefined) => void;
  onTimeChange: (t: string) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [h, m] = time.split(":");
  const now = new Date();
  const todaySelected = date ? isToday(date) : false;

  const availableHours = todaySelected
    ? ALL_HOURS.filter(hh => Number(hh) >= now.getHours())
    : ALL_HOURS;

  const availableMinutes = (todaySelected && Number(h) === now.getHours())
    ? ALL_MINUTES.filter(mm => Number(mm) > now.getMinutes())
    : ALL_MINUTES;

  const safeH = availableHours.includes(h) ? h : (availableHours[0] ?? "00");
  const safeM = availableMinutes.includes(m) ? m : (availableMinutes[0] ?? "00");
  if (safeH !== h || safeM !== m) onTimeChange(`${safeH}:${safeM}`);

  const handleDateSelect = (d: Date | undefined) => {
    onDateChange(d);
    if (d) {
      // Pré-remplir l'heure avec l'heure actuelle arrondie si date = aujourd'hui
      if (isToday(d)) onTimeChange(nextRoundedTime());
      setOpen(false);
    }
  };

  return (
    <div className="space-y-1">
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}{required && <span className="text-red-400">*</span>}
      </p>
      <div className="flex gap-1.5">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex flex-1 items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-3 py-1.5 font-mono text-[11px] text-foreground transition hover:border-[#7158ff]/40 focus:outline-none"
            >
              <CalendarIcon className="size-3 shrink-0 text-muted-foreground" />
              {date ? format(date, "dd/MM/yyyy", { locale: fr }) : <span className="text-muted-foreground/50">jj/mm/aaaa</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={(d) => d < new Date(Date.now() - 86400000)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Select value={safeH} onValueChange={v => onTimeChange(`${v}:${safeM}`)}>
          <SelectTrigger className="w-20 border-dashed font-mono text-[11px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableHours.map(hh => (
              <SelectItem key={hh} value={hh} className="font-mono text-[11px]">{hh}h</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={safeM} onValueChange={v => onTimeChange(`${safeH}:${v}`)}>
          <SelectTrigger className="w-20 border-dashed font-mono text-[11px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableMinutes.map(mm => (
              <SelectItem key={mm} value={mm} className="font-mono text-[11px]">{mm}min</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Combine date + time string → UTC ISO
function toISO(date: Date | undefined, time: string): string | null {
  if (!date) return null;
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

// ── Preview embed Discord ─────────────────────────────────────────────────────

function EmbedPreview({ form }: { form: ReturnType<typeof makeDefaultForm> }) {
  const color = form.embedColor ? `#${form.embedColor}` : "#7158ff";
  const endISO = toISO(form.endDate, form.endTime);
  const endDate = endISO ? new Date(endISO) : null;

  return (
    <div className="rounded-lg overflow-hidden border border-dashed" style={{ borderLeftColor: color, borderLeftWidth: 4 }}>
      <div className="bg-[#313338] px-3 py-2.5 space-y-1">
        <p className="font-semibold text-white text-sm">🎁 {form.title || "Titre du giveaway"}</p>
        {form.description && <p className="text-[#b5bac1] text-xs">{form.description}</p>}
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 pt-1">
          <div>
            <p className="text-[#b5bac1] text-[9px] font-semibold uppercase tracking-wide">Lot</p>
            <p className="text-white text-xs font-bold">{form.prize || "—"}</p>
          </div>
          <div>
            <p className="text-[#b5bac1] text-[9px] font-semibold uppercase tracking-wide">Gagnant(s)</p>
            <p className="text-white text-xs">{form.winnerCount}</p>
          </div>
          <div>
            <p className="text-[#b5bac1] text-[9px] font-semibold uppercase tracking-wide">Mode</p>
            <p className="text-white text-xs">{MODE_LABELS[form.mode].label}</p>
          </div>
        </div>
        {form.embedImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.embedImage} alt="" className="mt-2 w-full rounded object-cover max-h-32" onError={e => (e.currentTarget.style.display = "none")} />
        )}
        {endDate && (
          <p className="text-[#87898c] text-[9px] pt-1">
            Se termine le {format(endDate, "dd/MM/yyyy", { locale: fr })} à {format(endDate, "HH:mm")}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

// Convertit un giveaway existant en données de formulaire
function giveawayToForm(g: Giveaway, channelId = ""): ReturnType<typeof makeDefaultForm> {
  const endDate = new Date(g.endAt);
  const startDate = g.startAt ? new Date(g.startAt) : undefined;
  return {
    channelId: g.channelId || channelId,
    title: g.title,
    prize: g.prize,
    description: g.description ?? "",
    mode: g.mode,
    winnerCount: g.winnerCount,
    endDate,
    endTime: format(endDate, "HH:mm"),
    startDate,
    startTime: startDate ? format(startDate, "HH:mm") : "12:00",
    requiredRoleIds: (g.requiredRoleIds ?? []).join(", "),
    minLevel: g.minLevel ? String(g.minLevel) : "",
    mustBeBooster: g.mustBeBooster,
    minDaysOnServer: g.minDaysOnServer ? String(g.minDaysOnServer) : "",
    useEmbed: g.useEmbed,
    embedColor: g.embedColor ?? "7158ff",
    embedImage: g.embedImage ?? "",
  };
}

export default function GiveawayPage() {
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // editingId = null → création, string → édition du giveaway avec cet id
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => makeDefaultForm());
  const [submitting, setSubmitting] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);

  const fetchGiveaways = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    const res = await fetch(`/api/bot/giveaways?botId=${config.id}`);
    if (res.ok) setGiveaways(await res.json());
    setLoading(false);
  }, [config]);

  useEffect(() => { fetchGiveaways(); }, [fetchGiveaways]);

  useEffect(() => {
    if (!config) return;
    setForm(makeDefaultForm(config.config.giveawayDefaultChannelId ?? ""));
  }, [config?.id]);

  const openCreate = () => {
    setEditingId(null);
    setForm(makeDefaultForm(config?.config.giveawayDefaultChannelId ?? ""));
    setShowForm(true);
  };

  const openEdit = (g: Giveaway) => {
    setEditingId(g.id);
    setForm(giveawayToForm(g));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Copier → pré-remplit le form mais sans dates (mode création)
  const openCopy = (g: Giveaway) => {
    setEditingId(null);
    setForm({
      ...giveawayToForm(g),
      endDate: undefined,
      endTime: "20:00",
      startDate: undefined,
      startTime: "12:00",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    if (config) setForm(makeDefaultForm(config.config.giveawayDefaultChannelId ?? ""));
  };

  const buildPayload = () => {
    const endISO = toISO(form.endDate, form.endTime);
    const startISO = form.startDate ? toISO(form.startDate, form.startTime) : null;
    return {
      endAt: endISO,
      startAt: startISO,
      title: form.title,
      prize: form.prize,
      description: form.description || null,
      mode: form.mode,
      winnerCount: Number(form.winnerCount),
      requiredRoleIds: form.requiredRoleIds ? form.requiredRoleIds.split(",").map(s => s.trim()).filter(Boolean) : null,
      minLevel: form.minLevel ? Number(form.minLevel) : null,
      mustBeBooster: form.mustBeBooster,
      minDaysOnServer: form.minDaysOnServer ? Number(form.minDaysOnServer) : null,
      useEmbed: form.useEmbed,
      embedColor: form.useEmbed ? (form.embedColor || null) : null,
      embedImage: form.useEmbed ? (form.embedImage || null) : null,
    };
  };

  const handleSubmit = async () => {
    if (!config || !form.title || !form.prize || !form.channelId || !form.endDate) return;
    setSubmitting(true);
    const payload = buildPayload();

    if (editingId) {
      // Édition
      const res = await fetch(`/api/bot/giveaways/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setGiveaways(prev => prev.map(g => g.id === editingId ? updated : g));
        closeForm();
      }
    } else {
      // Création
      const res = await fetch("/api/bot/giveaways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: config.id,
          channelId: form.channelId,
          ...payload,
        }),
      });
      if (res.ok) {
        const g = await res.json();
        setGiveaways(prev => [g, ...prev]);
        closeForm();
      }
    }
    setSubmitting(false);
  };

  const doAction = async (id: string, action: "end" | "cancel" | "reroll") => {
    setActioning(id + action);
    const res = await fetch(`/api/bot/giveaways/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      const updated = await res.json();
      setGiveaways(prev => prev.map(g => g.id === id ? updated : g));
    }
    setActioning(null);
  };

  const doDelete = async (id: string) => {
    setActioning(id + "delete");
    const res = await fetch(`/api/bot/giveaways/${id}`, { method: "DELETE" });
    if (res.ok) setGiveaways(prev => prev.filter(g => g.id !== id));
    setActioning(null);
  };

  if (!config) return <LoadingScreen />;

  const active = giveaways.filter(g => g.status === "ACTIVE" || g.status === "PENDING");
  const past   = giveaways.filter(g => g.status === "ENDED"  || g.status === "CANCELLED");
  const canCreate = !!(form.title && form.prize && form.channelId && form.endDate);

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Gift className="size-4" />}
        title="Giveaway"
        subtitle="Organise des concours avec tirage automatique"
        status={config.status}
      />

      {/* Config globale */}
      <div className="space-y-2 rounded-xl border border-dashed bg-card p-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— config globale —</p>
        <div className="grid grid-cols-2 gap-2">
          <CyberInput
            label="salon_par_defaut"
            value={config.config.giveawayDefaultChannelId ?? ""}
            onChange={v => updateModuleConfig("giveawayDefaultChannelId", v)}
            placeholder="ID salon Discord"
          />
          <CyberInput
            label="role_gestionnaire"
            value={config.config.giveawayManagerRoleId ?? ""}
            onChange={v => updateModuleConfig("giveawayManagerRoleId", v)}
            placeholder="ID rôle (vide = admin)"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 pt-1">
          <input
            type="checkbox"
            checked={config.config.giveawayDmWinners ?? true}
            onChange={e => updateModuleConfig("giveawayDmWinners", e.target.checked)}
            className="accent-[#7158ff]"
          />
          <span className="font-mono text-[11px] text-foreground">DM automatique aux gagnants</span>
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Save className="size-3.5" />
          {saved ? "✓ saved" : saving ? "saving..." : "save_config"}
        </button>
        <button
          onClick={showForm ? closeForm : openCreate}
          className="flex items-center gap-2 rounded-lg bg-[#7158ff] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-85"
        >
          {showForm ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
          {showForm ? "annuler" : "nouveau_giveaway"}
        </button>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <div className="space-y-3 rounded-xl border border-[#7158ff]/20 bg-[#7158ff]/5 p-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[#7158ff]/70">
            {editingId ? "— modifier le giveaway —" : "— nouveau giveaway —"}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <CyberInput label="titre*" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="ex: Nitro x3 mois" />
            <CyberInput label="lot*" value={form.prize} onChange={v => setForm(f => ({ ...f, prize: v }))} placeholder="ex: Discord Nitro" />
          </div>
          <CyberInput label="description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Optionnel" />
          <CyberInput
            label={`salon_du_giveaway${config.config.giveawayDefaultChannelId ? " (pré-rempli)" : "*"}`}
            value={form.channelId}
            onChange={v => setForm(f => ({ ...f, channelId: v }))}
            placeholder="ID salon Discord"
          />

          {/* Mode + nb gagnants */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">mode_tirage</p>
              <div className="flex gap-1.5">
                {(["RANDOM", "WEIGHTED", "FIRST"] as GiveawayMode[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, mode: m }))}
                    className={`rounded border px-2 py-0.5 font-mono text-[9px] transition ${
                      form.mode === m
                        ? "border-[#7158ff]/40 bg-[#7158ff]/15 text-[#7158ff]"
                        : "border-dashed text-muted-foreground/50 hover:border-[#7158ff]/20"
                    }`}
                  >
                    {MODE_LABELS[m].label}
                  </button>
                ))}
              </div>
              <p className="font-mono text-[9px] text-muted-foreground/50">{MODE_LABELS[form.mode].desc}</p>
            </div>
            <CyberInput
              label="nb_gagnants"
              value={String(form.winnerCount)}
              onChange={v => setForm(f => ({ ...f, winnerCount: Number(v) || 1 }))}
              placeholder="1"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-2">
            <DateTimePicker
              label="fin_le"
              date={form.endDate}
              time={form.endTime}
              onDateChange={d => setForm(f => ({ ...f, endDate: d }))}
              onTimeChange={t => setForm(f => ({ ...f, endTime: t }))}
              required
            />
            <DateTimePicker
              label="debut_le (optionnel)"
              date={form.startDate}
              time={form.startTime}
              onDateChange={d => setForm(f => ({ ...f, startDate: d }))}
              onTimeChange={t => setForm(f => ({ ...f, startTime: t }))}
            />
          </div>

          {/* Conditions */}
          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— conditions d'entrée —</p>
          <div className="grid grid-cols-2 gap-2">
            <CyberInput label="roles_requis (IDs, virgule)" value={form.requiredRoleIds} onChange={v => setForm(f => ({ ...f, requiredRoleIds: v }))} placeholder="ID1,ID2" />
            <CyberInput label="niveau_xp_min" value={form.minLevel} onChange={v => setForm(f => ({ ...f, minLevel: v }))} placeholder="ex: 5" />
            <CyberInput label="anciennete_min (jours)" value={form.minDaysOnServer} onChange={v => setForm(f => ({ ...f, minDaysOnServer: v }))} placeholder="ex: 7" />
            <label className="flex cursor-pointer items-center gap-2 self-end pb-1.5">
              <input
                type="checkbox"
                checked={form.mustBeBooster}
                onChange={e => setForm(f => ({ ...f, mustBeBooster: e.target.checked }))}
                className="accent-[#7158ff]"
              />
              <span className="font-mono text-[11px] text-foreground">Booster uniquement</span>
            </label>
          </div>

          {/* Options embed */}
          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— apparence —</p>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.useEmbed}
              onChange={e => setForm(f => ({ ...f, useEmbed: e.target.checked }))}
              className="accent-[#7158ff]"
            />
            <span className="font-mono text-[11px] text-foreground">Utiliser un embed Discord</span>
          </label>

          {form.useEmbed && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">couleur_embed</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={`#${form.embedColor ?? "7158ff"}`}
                    onChange={e => setForm(f => ({ ...f, embedColor: e.target.value.replace("#", "") }))}
                    className="size-8 cursor-pointer rounded border border-dashed bg-transparent"
                  />
                  <span className="font-mono text-[10px] text-muted-foreground">#{form.embedColor || "7158ff"}</span>
                </div>
              </div>
              <CyberInput
                label="image_url (optionnel)"
                value={form.embedImage}
                onChange={v => setForm(f => ({ ...f, embedImage: v }))}
                placeholder="https://..."
              />
            </div>
          )}

          {/* Prévisualisation */}
          {form.useEmbed && (
            <div className="space-y-1">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50">— aperçu Discord —</p>
              <EmbedPreview form={form} />
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSubmit}
              disabled={submitting || !canCreate}
              className="flex items-center gap-2 rounded-lg bg-[#7158ff] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-85 disabled:opacity-40"
            >
              <Gift className="size-3.5" />
              {submitting
                ? (editingId ? "enregistrement..." : "création...")
                : (editingId ? "enregistrer_les_modifications" : "lancer_le_giveaway")}
            </button>
          </div>
        </div>
      )}

      {/* Giveaways actifs */}
      {active.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-green-500/70">— en cours ({active.length}) —</p>
          {active.map(g => (
            <GiveawayCard key={g.id} g={g} actioning={actioning} onAction={doAction} onDelete={doDelete} onEdit={openEdit} onCopy={openCopy} />
          ))}
        </div>
      )}

      {/* Giveaways passés */}
      {past.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50">— terminés ({past.length}) —</p>
          {past.map(g => (
            <GiveawayCard key={g.id} g={g} actioning={actioning} onAction={doAction} onDelete={doDelete} onEdit={openEdit} onCopy={openCopy} />
          ))}
        </div>
      )}

      {!loading && giveaways.length === 0 && !showForm && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Gift className="size-8 text-muted-foreground/20" />
          <p className="font-mono text-xs text-muted-foreground/50">Aucun giveaway — crée le premier !</p>
        </div>
      )}
    </div>
  );
}

function GiveawayCard({
  g,
  actioning,
  onAction,
  onDelete,
  onEdit,
  onCopy,
}: {
  g: Giveaway;
  actioning: string | null;
  onAction: (id: string, action: "end" | "cancel" | "reroll") => void;
  onDelete: (id: string) => void;
  onEdit: (g: Giveaway) => void;
  onCopy: (g: Giveaway) => void;
}) {
  const status = STATUS_LABELS[g.status];
  const mode   = MODE_LABELS[g.mode];
  const ended  = isPast(new Date(g.endAt));
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(g.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-sm font-bold text-foreground">{g.title}</p>
            <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] ${status.color}`}>{status.label}</span>
            <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] ${mode.color}`}>{mode.label}</span>
            {!g.useEmbed && (
              <span className="rounded border border-dashed px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/50">texte simple</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Trophy className="size-2.5 text-yellow-500" />
              {g.prize}
            </span>
            <span>{g.winnerCount} gagnant{g.winnerCount > 1 ? "s" : ""}</span>
            <span>{g.participantCount} participant{g.participantCount > 1 ? "s" : ""}</span>
            <span>
              {ended
                ? `Terminé le ${format(new Date(g.endAt), "dd/MM/yyyy HH:mm", { locale: fr })}`
                : `Se termine ${formatDistanceToNow(new Date(g.endAt), { addSuffix: true, locale: fr })}`}
            </span>
          </div>
          {g.winnerIds && g.winnerIds.length > 0 && (
            <p className="font-mono text-[10px] text-yellow-500">
              🏆 Gagnant{g.winnerIds.length > 1 ? "s" : ""} : {g.winnerIds.join(", ")}
            </p>
          )}
          <button
            onClick={copyId}
            className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground/30 transition hover:text-muted-foreground/60"
          >
            {copied ? <Check className="size-2.5 text-green-500" /> : <Copy className="size-2.5" />}
            {copied ? "copié !" : g.id}
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {/* Modifier — actif/en attente uniquement */}
          {(g.status === "ACTIVE" || g.status === "PENDING") && (
            <button
              onClick={() => onEdit(g)}
              disabled={!!actioning}
              title="Modifier"
              className="rounded-lg border border-dashed p-1.5 text-muted-foreground/50 transition hover:border-[#7158ff]/30 hover:text-[#7158ff] disabled:opacity-30"
            >
              <Pencil className="size-3" />
            </button>
          )}
          {/* Copier — toujours disponible */}
          <button
            onClick={() => onCopy(g)}
            disabled={!!actioning}
            title="Dupliquer"
            className="rounded-lg border border-dashed p-1.5 text-muted-foreground/50 transition hover:border-blue-500/30 hover:text-blue-400 disabled:opacity-30"
          >
            <Copy className="size-3" />
          </button>
          {(g.status === "ACTIVE" || g.status === "PENDING") && (
            <>
              <button
                onClick={() => onAction(g.id, "end")}
                disabled={!!actioning}
                title="Terminer maintenant"
                className="rounded-lg border border-dashed p-1.5 text-muted-foreground/50 transition hover:border-yellow-500/30 hover:text-yellow-400 disabled:opacity-30"
              >
                <Square className="size-3" />
              </button>
              <button
                onClick={() => onAction(g.id, "cancel")}
                disabled={!!actioning}
                title="Annuler"
                className="rounded-lg border border-dashed p-1.5 text-muted-foreground/50 transition hover:border-red-500/30 hover:text-red-400 disabled:opacity-30"
              >
                <X className="size-3" />
              </button>
            </>
          )}
          {g.status === "ENDED" && (
            <button
              onClick={() => onAction(g.id, "reroll")}
              disabled={!!actioning}
              title="Re-roll"
              className="rounded-lg border border-dashed p-1.5 text-muted-foreground/50 transition hover:border-[#7158ff]/30 hover:text-[#7158ff] disabled:opacity-30"
            >
              <RotateCcw className="size-3" />
            </button>
          )}
          {(g.status === "ENDED" || g.status === "CANCELLED") && (
            <button
              onClick={() => onDelete(g.id)}
              disabled={!!actioning}
              title="Supprimer"
              className="rounded-lg border border-dashed p-1.5 text-muted-foreground/50 transition hover:border-red-500/30 hover:text-red-400 disabled:opacity-30"
            >
              <Trash2 className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
