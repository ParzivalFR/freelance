"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// ─── CyberLabel ───────────────────────────────────────────────────────────────

export function CyberLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
      {children}
    </span>
  );
}

// ─── CyberInput ───────────────────────────────────────────────────────────────

export function CyberInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1.5">
      <CyberLabel>{label}</CyberLabel>
      <div className="relative flex items-center">
        <span className="absolute left-3 font-mono text-xs text-blue-500/40">›</span>
        <input
          type={isPassword && !show ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-dashed bg-background py-2.5 pl-7 pr-9 font-mono text-sm text-foreground placeholder-muted-foreground/40 outline-hidden transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── FORMAT_ACTIONS + CyberTextarea ───────────────────────────────────────────

export const FORMAT_ACTIONS = [
  { label: "B",  wrap: ["**", "**"],   title: "Gras" },
  { label: "I",  wrap: ["*", "*"],     title: "Italique" },
  { label: "U",  wrap: ["__", "__"],   title: "Souligné" },
  { label: "~~", wrap: ["~~", "~~"],   title: "Barré" },
  { label: "`",  wrap: ["`", "`"],     title: "Code inline" },
  { label: "• ", wrap: ["\n• ", ""],   title: "Puce" },
  { label: "↵",  wrap: ["\n", ""],     title: "Saut de ligne" },
] as const;

export function CyberTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (wrap: readonly [string, string]) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const before = value.slice(0, start);
    const after = value.slice(end);
    const newVal = before + wrap[0] + selected + wrap[1] + after;
    onChange(newVal);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + wrap[0].length + selected.length + wrap[1].length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="space-y-1.5">
      <CyberLabel>{label}</CyberLabel>
      <div className="flex flex-wrap gap-1">
        {FORMAT_ACTIONS.map((action) => (
          <button
            key={action.title}
            type="button"
            title={action.title}
            onMouseDown={(e) => { e.preventDefault(); applyFormat(action.wrap); }}
            className="rounded border border-dashed px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-400"
          >
            {action.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <span className="absolute left-3 top-3 font-mono text-xs text-blue-500/40">›</span>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full resize-y rounded-lg border border-dashed bg-background py-2.5 pl-7 pr-3 font-mono text-sm text-foreground placeholder-muted-foreground/40 outline-hidden transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10"
        />
      </div>
    </div>
  );
}

// ─── PlaceholderRef ───────────────────────────────────────────────────────────

const PLACEHOLDERS = [
  { key: "{username}", desc: "Pseudo affiché" },
  { key: "{mention}", desc: "Mention @cliquable" },
  { key: "{tag}", desc: "Username brut" },
  { key: "{userId}", desc: "ID numérique" },
  { key: "{server}", desc: "Nom du serveur" },
  { key: "{memberCount}", desc: "Nb de membres" },
  { key: "{joinDate}", desc: "Date d'arrivée" },
  { key: "{joinTime}", desc: "Heure d'arrivée" },
  { key: "{accountAge}", desc: "Âge du compte" },
];

export function PlaceholderRef() {
  return (
    <div className="rounded-lg border border-dashed p-3">
      <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        placeholders_disponibles
      </p>
      <div className="flex flex-wrap gap-1.5">
        {PLACEHOLDERS.map(({ key, desc }) => (
          <span
            key={key}
            title={desc}
            className="cursor-default rounded border border-blue-500/20 bg-blue-500/5 px-1.5 py-0.5 font-mono text-[10px] text-blue-400"
          >
            {key}
          </span>
        ))}
      </div>
      <p className="mt-2 font-mono text-[9px] text-muted-foreground/50">
        ⚠ {"{mention}"} ne s&apos;affiche pas dans les titres d&apos;embed — utilise {"{username}"}
      </p>
    </div>
  );
}

// ─── ModuleToggle ─────────────────────────────────────────────────────────────

export function ModuleToggle({
  icon,
  label,
  description,
  enabled,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        enabled ? "border-blue-500/20 bg-blue-500/5" : "border-dashed bg-card"
      }`}
    >
      <div className="flex items-center gap-3 p-3.5">
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            enabled ? "bg-blue-500/15 text-blue-500" : "bg-muted text-muted-foreground"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs font-semibold text-foreground">{label}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={enabled} onCheckedChange={onToggle} className="scale-90" />
          {enabled && children && (
            <button
              onClick={() => setOpen(!open)}
              className="text-muted-foreground/50 transition-colors hover:text-muted-foreground"
            >
              {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {enabled && open && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-blue-500/10"
          >
            <div className="space-y-3 p-3.5 pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  sub,
  accent = false,
  pulse = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  pulse?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        accent ? "border-blue-500/30 bg-blue-500/5" : "border-dashed bg-card"
      }`}
    >
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {pulse && (
          <div
            className={`size-2 shrink-0 rounded-full ${
              accent ? "animate-pulse bg-blue-400" : "bg-muted-foreground/30"
            }`}
          />
        )}
        <p
          className={`font-mono text-sm font-bold ${
            accent ? "text-blue-500" : "text-foreground"
          }`}
        >
          {value}
        </p>
      </div>
      {sub && (
        <p className="mt-1 font-mono text-[10px] text-muted-foreground/60">{sub}</p>
      )}
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

export function PageHeader({
  icon,
  title,
  subtitle,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status?: string;
}) {
  const statusColor =
    status === "ONLINE"
      ? "text-green-500"
      : status === "STARTING"
        ? "text-yellow-500"
        : "text-muted-foreground";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
          {icon}
        </div>
        <div>
          <h1 className="font-mono text-sm font-bold text-foreground">{title}</h1>
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
      {status && (
        <div className="flex items-center gap-2">
          <div
            className={`size-2 rounded-full ${
              status === "ONLINE"
                ? "animate-pulse bg-green-500"
                : status === "STARTING"
                  ? "animate-pulse bg-yellow-500"
                  : "bg-muted-foreground/30"
            }`}
          />
          <span className={`font-mono text-[11px] font-bold ${statusColor}`}>
            {status}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── SaveBar ──────────────────────────────────────────────────────────────────

export function SaveBar({
  saving,
  saved,
  onSave,
}: {
  saving: boolean;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex justify-end">
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 rounded-lg border border-dashed px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
      >
        {saved ? "✓ saved" : saving ? "saving..." : "save_config"}
      </button>
    </div>
  );
}

// ─── LoadingScreen ────────────────────────────────────────────────────────────

export function LoadingScreen() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="font-mono text-xs text-blue-500 animate-pulse">
        &gt; INITIALIZING...
      </div>
    </div>
  );
}
