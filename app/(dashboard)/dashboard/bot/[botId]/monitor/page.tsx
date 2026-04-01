"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Activity,
  Plus,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  Power,
  PowerOff,
  Pencil,
  Check,
  Tv2,
  Save,
} from "lucide-react";
import { PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonitorCheck {
  id: string;
  status: string;
  responseTime: number | null;
  checkedAt: string;
}

interface MonitorIncident {
  id: string;
  startedAt: string;
  resolvedAt: string | null;
}

interface Monitor {
  id: string;
  name: string;
  type: string;
  target: string;
  sshConfig: true | null;
  interval: number;
  status: string;
  lastCheckedAt: string | null;
  responseTime: number | null;
  alertChannelId: string | null;
  alertRoleId: string | null;
  active: boolean;
  createdAt: string;
  checks: MonitorCheck[];
  incidents: MonitorIncident[];
}

interface DbFields {
  host: string;
  port: string;
  user: string;
  password: string;
  dbName: string;
}

interface SshFields {
  enabled: boolean;
  host: string;
  port: string;
  user: string;
  authMethod: "password" | "key";
  password: string;
  privateKey: string;
}

interface NewMonitorForm {
  name: string;
  type: "HTTP" | "TCP" | "PING" | "POSTGRES" | "MYSQL" | "MARIADB";
  target: string;
  dbFields: DbFields;
  ssh: SshFields;
  interval: number;
  alertChannelId: string;
  alertRoleId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeUptime(checks: MonitorCheck[]): number {
  if (checks.length === 0) return 0;
  const up = checks.filter((c) => c.status === "UP").length;
  return Math.round((up / checks.length) * 100);
}

function computeUptimeFromIncidents(incidents: MonitorIncident[], days: number): number | null {
  const now = Date.now();
  const periodStart = now - days * 24 * 60 * 60 * 1000;
  const periodDuration = now - periodStart;

  let downtime = 0;
  for (const incident of incidents) {
    const start = Math.max(new Date(incident.startedAt).getTime(), periodStart);
    const end = incident.resolvedAt ? new Date(incident.resolvedAt).getTime() : now;
    if (end > periodStart) downtime += Math.max(0, end - start);
  }

  const pct = ((periodDuration - downtime) / periodDuration) * 100;
  return Math.round(pct * 10) / 10;
}

function getStatusColor(status: string) {
  if (status === "UP") return "bg-green-500";
  if (status === "DOWN") return "bg-red-500";
  return "bg-muted-foreground/30";
}

function getStatusBadge(status: string) {
  if (status === "UP")
    return "border-green-500/30 bg-green-500/10 text-green-500";
  if (status === "DOWN")
    return "border-red-500/30 bg-red-500/10 text-red-500";
  return "border-muted-foreground/20 bg-muted/30 text-muted-foreground";
}

function formatDuration(startedAt: string, resolvedAt: string | null): string {
  const start = new Date(startedAt).getTime();
  const end = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
  const seconds = Math.floor((end - start) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}min`;
}

function getTypeHint(type: "HTTP" | "TCP" | "PING"): string {
  if (type === "HTTP") return "https://example.com";
  if (type === "TCP") return "example.com:25565";
  return "192.168.1.1 ou example.com";
}

function buildConnectionString(type: string, db: DbFields): string {
  const scheme = type === "POSTGRES" ? "postgresql" : "mysql";
  const port = db.port || (type === "POSTGRES" ? "5432" : "3306");
  const user = encodeURIComponent(db.user);
  const pass = encodeURIComponent(db.password);
  return `${scheme}://${user}:${pass}@${db.host}:${port}/${db.dbName}`;
}

function defaultPort(type: string): string {
  return type === "POSTGRES" ? "5432" : "3306";
}

// ─── UptimeBar component ──────────────────────────────────────────────────────

function UptimeBar({ check }: { check: MonitorCheck }) {
  const color = getStatusColor(check.status);
  const date = new Date(check.checkedAt).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });
  const isUp = check.status === "UP";
  const statusColor = isUp ? "text-green-500" : check.status === "DOWN" ? "text-red-500" : "text-muted-foreground";

  return (
    <div className="group relative flex-shrink-0 cursor-pointer">
      {/* Bar */}
      <div
        className={`h-6 w-1.5 rounded-sm ${color} opacity-70 transition-all duration-150 group-hover:opacity-100 group-hover:scale-y-110 group-hover:w-2 origin-bottom`}
      />
      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2.5 -translate-x-1/2 flex-col items-center hidden group-hover:flex animate-in fade-in zoom-in-95 duration-100">
        <div className="rounded-lg border border-dashed bg-card px-3 py-2 shadow-xl whitespace-nowrap space-y-0.5">
          <p className={`font-mono text-[10px] font-bold ${statusColor}`}>
            {check.status}
          </p>
          <p className="font-mono text-[9px] text-muted-foreground">{date}</p>
          {check.responseTime !== null && (
            <p className={`font-mono text-[9px] font-medium ${check.responseTime < 200 ? "text-green-500" : check.responseTime < 500 ? "text-yellow-500" : "text-red-500"}`}>
              {check.responseTime}ms
            </p>
          )}
        </div>
        {/* Arrow */}
        <div className="w-2 h-2 rotate-45 border-b border-r border-dashed bg-card -mt-1" />
      </div>
    </div>
  );
}

// ─── StatusDot component ──────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  if (status === "UP") {
    return (
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
        <span className="relative inline-flex size-2.5 rounded-full bg-green-500" />
      </span>
    );
  }
  if (status === "DOWN") {
    return <span className="inline-flex size-2.5 rounded-full bg-red-500" />;
  }
  return <span className="inline-flex size-2.5 rounded-full bg-muted-foreground/30" />;
}

const EMPTY_DB_FIELDS: DbFields = { host: "", port: "", user: "", password: "", dbName: "" };
const EMPTY_SSH: SshFields = { enabled: false, host: "", port: "22", user: "", authMethod: "password", password: "", privateKey: "" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MonitorPage() {
  const params = useParams();
  const botId = params?.botId as string;

  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dbInputMode, setDbInputMode] = useState<"fields" | "string">("fields");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; interval: number; alertChannelId: string; alertRoleId: string; target: string; dbFields: DbFields; ssh: SshFields; dbInputMode: "fields" | "string" } | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [boardForm, setBoardForm] = useState({
    enabled: false,
    channelId: "",
    title: "",
    useEmbed: true,
    showResponseTime: true,
  });
  const [boardLoaded, setBoardLoaded] = useState(false);
  const [savingBoard, setSavingBoard] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);

  const [form, setForm] = useState<NewMonitorForm>({
    name: "",
    type: "HTTP",
    target: "",
    dbFields: EMPTY_DB_FIELDS,
    ssh: EMPTY_SSH,
    interval: 5,
    alertChannelId: "",
    alertRoleId: "",
  });

  const isDbType = ["POSTGRES", "MYSQL", "MARIADB"].includes(form.type);

  const fetchMonitors = useCallback(async () => {
    if (!botId) return;
    try {
      const res = await fetch(`/api/bot/monitors?botId=${botId}`);
      const data = await res.json();
      setMonitors(data.monitors ?? []);
    } finally {
      setLoading(false);
    }
  }, [botId]);

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 30_000);
    return () => clearInterval(interval);
  }, [fetchMonitors]);

  useEffect(() => {
    if (!botId || boardLoaded) return;
    fetch(`/api/bot/config?botId=${botId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.config) {
          const c = data.config;
          setBoardForm({
            enabled: c.statusBoardEnabled ?? false,
            channelId: c.statusBoardChannelId ?? "",
            title: c.statusBoardTitle ?? "",
            useEmbed: c.statusBoardUseEmbed !== false,
            showResponseTime: c.statusBoardShowResponseTime !== false,
          });
        }
        setBoardLoaded(true);
      })
      .catch(() => setBoardLoaded(true));
  }, [botId, boardLoaded]);

  async function saveBoard() {
    setSavingBoard(true);
    try {
      const res = await fetch("/api/bot/config?botId=" + botId, { method: "GET" });
      const data = await res.json();
      const existingConfig = data?.config ?? {};
      await fetch("/api/bot/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: botId,
          config: {
            ...existingConfig,
            statusBoardEnabled: boardForm.enabled,
            statusBoardChannelId: boardForm.channelId,
            statusBoardTitle: boardForm.title,
            statusBoardUseEmbed: boardForm.useEmbed,
            statusBoardShowResponseTime: boardForm.showResponseTime,
          },
        }),
      });
    } finally {
      setSavingBoard(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const target = isDbType
      ? dbInputMode === "fields"
        ? buildConnectionString(form.type, form.dbFields)
        : form.target
      : form.target;
    if (!form.name.trim() || !target.trim()) return;
    if (isDbType && dbInputMode === "fields" && (!form.dbFields.host || !form.dbFields.user || !form.dbFields.dbName)) return;
    setSubmitting(true);
    try {
      const sshConfig = isDbType && form.ssh.enabled
        ? {
            host: form.ssh.host,
            port: parseInt(form.ssh.port || "22", 10),
            user: form.ssh.user,
            authMethod: form.ssh.authMethod,
            ...(form.ssh.authMethod === "password" ? { password: form.ssh.password } : { privateKey: form.ssh.privateKey }),
          }
        : null;

      const res = await fetch("/api/bot/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, name: form.name, type: form.type, target, sshConfig, interval: form.interval, alertChannelId: form.alertChannelId, alertRoleId: form.alertRoleId }),
      });
      if (res.ok) {
        setForm({ name: "", type: "HTTP", target: "", dbFields: EMPTY_DB_FIELDS, ssh: EMPTY_SSH, interval: 5, alertChannelId: "", alertRoleId: "" });
        setShowForm(false);
        await fetchMonitors();
      }
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(monitor: Monitor) {
    setEditingId(monitor.id);
    setEditForm({
      name: monitor.name,
      interval: monitor.interval,
      alertChannelId: monitor.alertChannelId ?? "",
      alertRoleId: monitor.alertRoleId ?? "",
      target: "",
      dbFields: EMPTY_DB_FIELDS,
      ssh: EMPTY_SSH,
      dbInputMode: "fields",
    });
  }

  async function handleEdit(e: React.FormEvent, monitor: Monitor) {
    e.preventDefault();
    if (!editForm) return;
    setEditSubmitting(true);
    try {
      const isDb = ["POSTGRES", "MYSQL", "MARIADB"].includes(monitor.type);
      let target = "";
      if (isDb && editForm.dbInputMode === "fields" && editForm.dbFields.host) {
        target = buildConnectionString(monitor.type, editForm.dbFields);
      } else if (editForm.target) {
        target = editForm.target;
      }

      const sshConfig = isDb && editForm.ssh.enabled && editForm.ssh.host
        ? {
            host: editForm.ssh.host,
            port: parseInt(editForm.ssh.port || "22", 10),
            user: editForm.ssh.user,
            authMethod: editForm.ssh.authMethod,
            ...(editForm.ssh.authMethod === "password" ? { password: editForm.ssh.password } : { privateKey: editForm.ssh.privateKey }),
          }
        : editForm.ssh.enabled === false && monitor.sshConfig
          ? null  // explicitly remove SSH
          : undefined; // keep existing

      const body: Record<string, unknown> = {
        name: editForm.name,
        interval: editForm.interval,
        alertChannelId: editForm.alertChannelId,
        alertRoleId: editForm.alertRoleId,
      };
      if (target) body.target = target;
      if (sshConfig !== undefined) body.sshConfig = sshConfig;

      const res = await fetch(`/api/bot/monitors/${monitor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditingId(null);
        setEditForm(null);
        await fetchMonitors();
      }
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/bot/monitors/${id}`, { method: "DELETE" });
    setMonitors((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleToggleActive(monitor: Monitor) {
    const res = await fetch(`/api/bot/monitors/${monitor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !monitor.active }),
    });
    if (res.ok) {
      const { monitor: updated } = await res.json();
      setMonitors((prev) => prev.map((m) => (m.id === updated.id ? { ...m, active: updated.active } : m)));
    }
  }

  if (loading) return <LoadingScreen />;

  const totalUp = monitors.filter((m) => m.status === "UP").length;
  const totalDown = monitors.filter((m) => m.status === "DOWN").length;
  const avgResponse =
    monitors.filter((m) => m.responseTime !== null).length > 0
      ? Math.round(
          monitors
            .filter((m) => m.responseTime !== null)
            .reduce((acc, m) => acc + (m.responseTime ?? 0), 0) /
            monitors.filter((m) => m.responseTime !== null).length
        )
      : null;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Activity className="size-4" />}
        title="Monitor"
        subtitle="Surveillance de disponibilité des services"
      />

      {/* Stats bar */}
      {monitors.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "total", value: monitors.length, color: "text-foreground" },
            { label: "en_ligne", value: totalUp, color: "text-green-500" },
            { label: "hors_ligne", value: totalDown, color: "text-red-500" },
            {
              label: "temps_rép_moy",
              value: avgResponse !== null ? `${avgResponse}ms` : "—",
              color: "text-blue-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-dashed p-3"
            >
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </p>
              <p className={`mt-1 font-mono text-lg font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Status Board config */}
      <div className="rounded-lg border border-dashed">
        <button
          onClick={() => setBoardOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <Tv2 className="size-3.5 text-muted-foreground/60" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              status board discord
            </span>
            {boardForm.enabled && (
              <span className="rounded border border-green-500/30 bg-green-500/10 px-1.5 py-0.5 font-mono text-[8px] text-green-500">
                actif
              </span>
            )}
          </div>
          {boardOpen ? (
            <ChevronUp className="size-3.5 text-muted-foreground/40" />
          ) : (
            <ChevronDown className="size-3.5 text-muted-foreground/40" />
          )}
        </button>

        {boardOpen && (
          <div className="border-t border-dashed px-4 py-4 space-y-4">
            <p className="font-mono text-[9px] text-muted-foreground/50">
              Un message épinglé dans un salon Discord, mis à jour automatiquement à chaque changement de statut.
            </p>

            {/* Toggle enabled */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">Activer le status board</span>
              <button
                type="button"
                onClick={() => setBoardForm((f) => ({ ...f, enabled: !f.enabled }))}
                className={`relative h-5 w-9 rounded-full transition-colors ${boardForm.enabled ? "bg-green-500/80" : "bg-muted-foreground/20"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${boardForm.enabled ? "left-4" : "left-0.5"}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Channel */}
              <div className="space-y-1">
                <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
                  salon Discord (ID)
                </label>
                <input
                  value={boardForm.channelId}
                  onChange={(e) => setBoardForm((f) => ({ ...f, channelId: e.target.value }))}
                  placeholder="123456789012345678"
                  className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                />
              </div>
              {/* Title */}
              <div className="space-y-1">
                <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
                  titre
                </label>
                <input
                  value={boardForm.title}
                  onChange={(e) => setBoardForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="📡 Status Board"
                  className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setBoardForm((f) => ({ ...f, useEmbed: !f.useEmbed }))}
                className={`rounded border px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest transition ${boardForm.useEmbed ? "border-blue-500/40 bg-blue-500/10 text-blue-400" : "border-dashed text-muted-foreground hover:text-foreground"}`}
              >
                {boardForm.useEmbed ? "embed ✓" : "texte brut"}
              </button>
              <button
                type="button"
                onClick={() => setBoardForm((f) => ({ ...f, showResponseTime: !f.showResponseTime }))}
                className={`rounded border px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest transition ${boardForm.showResponseTime ? "border-blue-500/40 bg-blue-500/10 text-blue-400" : "border-dashed text-muted-foreground hover:text-foreground"}`}
              >
                {boardForm.showResponseTime ? "temps rép. ✓" : "temps rép. ✗"}
              </button>
            </div>

            <button
              onClick={saveBoard}
              disabled={savingBoard}
              className="flex items-center gap-1.5 rounded border border-dashed px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-blue-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 disabled:opacity-40"
            >
              <Save className="size-3" />
              {savingBoard ? "sauvegarde..." : "sauvegarder"}
            </button>
          </div>
        )}
      </div>

      {/* Monitor cards */}
      <div className="space-y-3">
        {monitors.length === 0 && !showForm && (
          <div className="rounded-lg border border-dashed py-12 text-center">
            <p className="font-mono text-xs text-muted-foreground/50">
              aucun_monitor — ajoutez votre premier service ci-dessous
            </p>
          </div>
        )}

        {monitors.map((monitor) => {
          const last30 = monitor.checks.slice(0, 30).reverse();
          const uptime = computeUptime(monitor.checks);
          const uptime7d = computeUptimeFromIncidents(monitor.incidents, 7);
          const uptime30d = computeUptimeFromIncidents(monitor.incidents, 30);
          const isExpanded = expandedId === monitor.id;
          const openIncidents = monitor.incidents.filter((i) => !i.resolvedAt);

          return (
            <div
              key={monitor.id}
              className={`rounded-lg border border-dashed transition ${
                !monitor.active ? "opacity-50" : ""
              }`}
            >
              {/* Card header */}
              <div className="flex items-center gap-3 p-3">
                <StatusDot status={monitor.active ? monitor.status : "PENDING"} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {monitor.name}
                    </span>
                    <span
                      className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${getStatusBadge(
                        monitor.active ? monitor.status : "PENDING"
                      )}`}
                    >
                      {monitor.active ? monitor.status : "PAUSE"}
                    </span>
                    <span className="rounded border border-dashed px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      {monitor.type}
                    </span>
                    {monitor.sshConfig && (
                      <span className="rounded border border-yellow-500/30 bg-yellow-500/10 px-1.5 py-0.5 font-mono text-[9px] text-yellow-500">
                        SSH
                      </span>
                    )}
                    {openIncidents.length > 0 && (
                      <span className="rounded border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 font-mono text-[9px] text-red-500">
                        incident en cours
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                    {monitor.target}
                  </p>
                </div>

                {/* Response time + uptime */}
                <div className="hidden shrink-0 text-right sm:block space-y-0.5">
                  <p className="font-mono text-[10px] text-foreground">
                    {monitor.responseTime !== null ? `${monitor.responseTime}ms` : "—"}
                  </p>
                  <p className="font-mono text-[9px] text-muted-foreground/50">
                    <span title="7 derniers jours">{uptime7d !== null ? `${uptime7d}%` : "—"} 7j</span>
                    <span className="mx-1 opacity-30">·</span>
                    <span title="30 derniers jours">{uptime30d !== null ? `${uptime30d}%` : "—"} 30j</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => editingId === monitor.id ? (setEditingId(null), setEditForm(null)) : openEdit(monitor)}
                    title="Modifier"
                    className={`rounded p-1.5 transition ${editingId === monitor.id ? "text-blue-400" : "text-muted-foreground/50 hover:text-foreground"}`}
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(monitor)}
                    title={monitor.active ? "Mettre en pause" : "Activer"}
                    className="rounded p-1.5 text-muted-foreground/50 transition hover:text-foreground"
                  >
                    {monitor.active ? (
                      <PowerOff className="size-3.5" />
                    ) : (
                      <Power className="size-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : monitor.id)}
                    className="rounded p-1.5 text-muted-foreground/50 transition hover:text-foreground"
                  >
                    {isExpanded ? (
                      <ChevronUp className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(monitor.id)}
                    className="rounded p-1.5 text-muted-foreground/50 transition hover:text-red-500"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Uptime grid — last 30 checks */}
              {monitor.checks.length > 0 && (
                <div className="flex items-end gap-0.5 border-t border-dashed px-3 py-2">
                  <span className="mr-2 font-mono text-[8px] text-muted-foreground/40 self-center">
                    30 derniers
                  </span>
                  {last30.map((check, i) => (
                    <UptimeBar key={`${check.id}-${i}`} check={check} />
                  ))}
                  {last30.length < 30 &&
                    Array.from({ length: 30 - last30.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-6 w-1.5 flex-shrink-0 rounded-sm bg-muted-foreground/10" />
                    ))}
                </div>
              )}

              {/* Edit form */}
              {editingId === monitor.id && editForm && (
                <form
                  onSubmit={(e) => handleEdit(e, monitor)}
                  className="border-t border-dashed px-3 py-3 space-y-3"
                >
                  <p className="font-mono text-[9px] uppercase tracking-widest text-blue-400">modifier le monitor</p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-muted-foreground/60">nom</label>
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm((f) => f && ({ ...f, name: e.target.value }))}
                        required
                        className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-muted-foreground/60">intervalle</label>
                      <select
                        value={editForm.interval}
                        onChange={(e) => setEditForm((f) => f && ({ ...f, interval: Number(e.target.value) }))}
                        className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                      >
                        {[1, 5, 15, 30, 60].map((v) => (
                          <option key={v} value={v}>{v} minute{v > 1 ? "s" : ""}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-muted-foreground/60">salon alerte</label>
                      <input
                        value={editForm.alertChannelId}
                        onChange={(e) => setEditForm((f) => f && ({ ...f, alertChannelId: e.target.value }))}
                        placeholder="ID Discord"
                        className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-muted-foreground/60">rôle alerte</label>
                      <input
                        value={editForm.alertRoleId}
                        onChange={(e) => setEditForm((f) => f && ({ ...f, alertRoleId: e.target.value }))}
                        placeholder="ID Discord"
                        className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>

                  {/* Credentials update — only for DB types */}
                  {["POSTGRES", "MYSQL", "MARIADB"].includes(monitor.type) && (
                    <div className="space-y-2 rounded border border-dashed p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                          connexion — laisser vide pour conserver
                        </p>
                        <div className="flex rounded border border-dashed overflow-hidden">
                          {(["fields", "string"] as const).map((m) => (
                            <button key={m} type="button"
                              onClick={() => setEditForm((f) => f && ({ ...f, dbInputMode: m }))}
                              className={`px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest transition ${editForm.dbInputMode === m ? "bg-blue-500/10 text-blue-400" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              {m === "fields" ? "champs" : "string"}
                            </button>
                          ))}
                        </div>
                      </div>
                      {editForm.dbInputMode === "fields" ? (
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: "host", label: "hôte", placeholder: "127.0.0.1" },
                            { key: "port", label: "port", placeholder: defaultPort(monitor.type) },
                            { key: "user", label: "utilisateur", placeholder: "root" },
                            { key: "dbName", label: "base de données", placeholder: "mydb" },
                          ].map(({ key, label, placeholder }) => (
                            <div key={key} className="space-y-1">
                              <label className="font-mono text-[9px] text-muted-foreground/60">{label}</label>
                              <input
                                value={editForm.dbFields[key as keyof DbFields]}
                                onChange={(e) => setEditForm((f) => f && ({ ...f, dbFields: { ...f.dbFields, [key]: e.target.value } }))}
                                placeholder={placeholder}
                                className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                              />
                            </div>
                          ))}
                          <div className="space-y-1 col-span-2">
                            <label className="font-mono text-[9px] text-muted-foreground/60">mot de passe</label>
                            <input
                              value={editForm.dbFields.password}
                              onChange={(e) => setEditForm((f) => f && ({ ...f, dbFields: { ...f.dbFields, password: e.target.value } }))}
                              type="password" placeholder="••••••••"
                              className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                            />
                          </div>
                        </div>
                      ) : (
                        <input
                          value={editForm.target}
                          onChange={(e) => setEditForm((f) => f && ({ ...f, target: e.target.value }))}
                          type="password"
                          placeholder={monitor.type === "POSTGRES" ? "postgresql://user:pass@host:5432/db" : "mysql://user:pass@host:3306/db"}
                          className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                        />
                      )}

                      {/* SSH */}
                      <div className="flex items-center justify-between pt-1">
                        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">tunnel SSH {monitor.sshConfig ? "(actif)" : ""}</p>
                        <button type="button"
                          onClick={() => setEditForm((f) => f && ({ ...f, ssh: { ...f.ssh, enabled: !f.ssh.enabled } }))}
                          className={`rounded border px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest transition ${editForm.ssh.enabled ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" : "border-dashed text-muted-foreground hover:text-foreground"}`}
                        >
                          {editForm.ssh.enabled ? "modifier SSH" : monitor.sshConfig ? "conserver SSH" : "ajouter SSH"}
                        </button>
                      </div>
                      {editForm.ssh.enabled && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1 col-span-2">
                              <label className="font-mono text-[9px] text-muted-foreground/60">hôte SSH</label>
                              <input value={editForm.ssh.host} onChange={(e) => setEditForm((f) => f && ({ ...f, ssh: { ...f.ssh, host: e.target.value } }))} placeholder="vps.example.com" className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-yellow-500/50" />
                            </div>
                            <div className="space-y-1">
                              <label className="font-mono text-[9px] text-muted-foreground/60">port</label>
                              <input value={editForm.ssh.port} onChange={(e) => setEditForm((f) => f && ({ ...f, ssh: { ...f.ssh, port: e.target.value } }))} placeholder="22" className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-yellow-500/50" />
                            </div>
                          </div>
                          <input value={editForm.ssh.user} onChange={(e) => setEditForm((f) => f && ({ ...f, ssh: { ...f.ssh, user: e.target.value } }))} placeholder="utilisateur SSH" className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-yellow-500/50" />
                          <div className="flex gap-2">
                            {(["password", "key"] as const).map((m) => (
                              <button key={m} type="button" onClick={() => setEditForm((f) => f && ({ ...f, ssh: { ...f.ssh, authMethod: m } }))}
                                className={`rounded border px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest transition ${editForm.ssh.authMethod === m ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" : "border-dashed text-muted-foreground"}`}>
                                {m === "password" ? "mot de passe" : "clé privée"}
                              </button>
                            ))}
                          </div>
                          {editForm.ssh.authMethod === "password"
                            ? <input value={editForm.ssh.password} onChange={(e) => setEditForm((f) => f && ({ ...f, ssh: { ...f.ssh, password: e.target.value } }))} type="password" placeholder="mot de passe SSH" className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-yellow-500/50" />
                            : <textarea value={editForm.ssh.privateKey} onChange={(e) => setEditForm((f) => f && ({ ...f, ssh: { ...f.ssh, privateKey: e.target.value } }))} placeholder={"-----BEGIN OPENSSH PRIVATE KEY-----\n..."} rows={4} className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-[10px] text-foreground outline-none focus:border-yellow-500/50" />
                          }
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button type="submit" disabled={editSubmitting}
                      className="flex items-center gap-1.5 rounded border border-dashed px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-blue-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 disabled:opacity-40"
                    >
                      <Check className="size-3" />
                      {editSubmitting ? "sauvegarde..." : "sauvegarder"}
                    </button>
                    <button type="button" onClick={() => { setEditingId(null); setEditForm(null); }}
                      className="rounded border border-dashed px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
                    >
                      annuler
                    </button>
                  </div>
                </form>
              )}

              {/* Expanded — incidents */}
              {isExpanded && (
                <div className="border-t border-dashed px-3 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      historique des incidents
                    </p>
                    <div className="flex gap-3 font-mono text-[9px] text-muted-foreground/50 sm:hidden">
                      <span>{monitor.responseTime !== null ? `${monitor.responseTime}ms` : "—"}</span>
                      <span>{uptime7d !== null ? `${uptime7d}%` : "—"} 7j</span>
                      <span>{uptime30d !== null ? `${uptime30d}%` : "—"} 30j</span>
                    </div>
                  </div>

                  {monitor.incidents.length === 0 ? (
                    <p className="font-mono text-[9px] text-muted-foreground/40">
                      aucun incident enregistré
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {[...monitor.incidents]
                        .sort(
                          (a, b) =>
                            new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
                        )
                        .slice(0, 10)
                        .map((incident) => (
                          <div
                            key={incident.id}
                            className="flex items-center gap-2 rounded border border-dashed px-2 py-1.5"
                          >
                            <span
                              className={`inline-flex size-1.5 rounded-full ${
                                incident.resolvedAt ? "bg-green-500" : "bg-red-500"
                              }`}
                            />
                            <span className="font-mono text-[9px] text-muted-foreground">
                              {new Date(incident.startedAt).toLocaleString("fr-FR")}
                            </span>
                            <span className="font-mono text-[9px] text-muted-foreground/50">
                              durée : {formatDuration(incident.startedAt, incident.resolvedAt)}
                            </span>
                            {!incident.resolvedAt && (
                              <span className="ml-auto rounded border border-red-500/30 bg-red-500/10 px-1 py-0.5 font-mono text-[8px] text-red-500">
                                en cours
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[9px] text-muted-foreground/50 sm:grid-cols-4">
                    <div>
                      <span className="block text-[8px] uppercase tracking-widest">intervalle</span>
                      <span>{monitor.interval} min</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-widest">dernier check</span>
                      <span>
                        {monitor.lastCheckedAt
                          ? new Date(monitor.lastCheckedAt).toLocaleTimeString("fr-FR")
                          : "—"}
                      </span>
                    </div>
                    {monitor.alertChannelId && (
                      <div>
                        <span className="block text-[8px] uppercase tracking-widest">salon alerte</span>
                        <span className="truncate">{monitor.alertChannelId}</span>
                      </div>
                    )}
                    {monitor.alertRoleId && (
                      <div>
                        <span className="block text-[8px] uppercase tracking-widest">rôle alerte</span>
                        <span className="truncate">{monitor.alertRoleId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add monitor form */}
      {showForm ? (
        <div className="rounded-lg border border-dashed p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-400">
              nouveau_monitor
            </p>
            <button
              onClick={() => setShowForm(false)}
              className="text-muted-foreground/50 transition hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-3">
            {/* Name */}
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                nom
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Mon serveur web"
                required
                className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
              />
            </div>

            {/* Type */}
            <div className="space-y-1">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                type
              </p>
              <div className="flex flex-wrap gap-2">
                {(["HTTP", "TCP", "PING", "POSTGRES", "MYSQL", "MARIADB"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t, target: "", dbFields: EMPTY_DB_FIELDS, ssh: EMPTY_SSH }))}
                    className={`rounded-lg border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition ${
                      form.type === t
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                        : "border-dashed text-muted-foreground hover:border-blue-500/20 hover:text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Target — plain field for HTTP/TCP/PING, structured fields for DB types */}
            {isDbType ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    connexion — chiffrée AES-256 avant stockage
                  </p>
                  <div className="flex rounded border border-dashed overflow-hidden">
                    {(["fields", "string"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setDbInputMode(mode)}
                        className={`px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest transition ${
                          dbInputMode === mode
                            ? "bg-blue-500/10 text-blue-400"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {mode === "fields" ? "champs" : "string"}
                      </button>
                    ))}
                  </div>
                </div>
                {dbInputMode === "fields" ? (
                  <>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] text-muted-foreground/60">hôte</label>
                        <input
                          value={form.dbFields.host}
                          onChange={(e) => setForm((f) => ({ ...f, dbFields: { ...f.dbFields, host: e.target.value } }))}
                          placeholder="db.example.com"
                          required
                          className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] text-muted-foreground/60">port</label>
                        <input
                          value={form.dbFields.port}
                          onChange={(e) => setForm((f) => ({ ...f, dbFields: { ...f.dbFields, port: e.target.value } }))}
                          placeholder={defaultPort(form.type)}
                          className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] text-muted-foreground/60">utilisateur</label>
                        <input
                          value={form.dbFields.user}
                          onChange={(e) => setForm((f) => ({ ...f, dbFields: { ...f.dbFields, user: e.target.value } }))}
                          placeholder="postgres"
                          required
                          className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] text-muted-foreground/60">mot de passe</label>
                        <input
                          value={form.dbFields.password}
                          onChange={(e) => setForm((f) => ({ ...f, dbFields: { ...f.dbFields, password: e.target.value } }))}
                          type="password"
                          placeholder="••••••••"
                          className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-muted-foreground/60">base de données</label>
                      <input
                        value={form.dbFields.dbName}
                        onChange={(e) => setForm((f) => ({ ...f, dbFields: { ...f.dbFields, dbName: e.target.value } }))}
                        placeholder="mydb"
                        required
                        className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1">
                    <input
                      value={form.target}
                      onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
                      placeholder={form.type === "POSTGRES" ? "postgresql://user:pass@host:5432/db" : "mysql://user:pass@host:3306/db"}
                      type="password"
                      required
                      className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  cible
                </label>
                <input
                  value={form.target}
                  onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
                  placeholder={getTypeHint(form.type as "HTTP" | "TCP" | "PING")}
                  required
                  className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                />
                <p className="font-mono text-[9px] text-muted-foreground/40">
                  {form.type === "HTTP" && "URL complète avec protocole (https://)"}
                  {form.type === "TCP" && "Format : hôte:port — ex: play.example.com:25565"}
                  {form.type === "PING" && "Adresse IP ou nom de domaine"}
                </p>
              </div>
            )}

            {/* SSH Tunnel — only for DB types */}
            {isDbType && (
              <div className="space-y-2 rounded border border-dashed p-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    tunnel SSH
                  </p>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, ssh: { ...f.ssh, enabled: !f.ssh.enabled } }))}
                    className={`rounded border px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest transition ${
                      form.ssh.enabled
                        ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                        : "border-dashed text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {form.ssh.enabled ? "activé" : "désactivé"}
                  </button>
                </div>

                {form.ssh.enabled && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="font-mono text-[9px] text-muted-foreground/60">hôte SSH</label>
                        <input
                          value={form.ssh.host}
                          onChange={(e) => setForm((f) => ({ ...f, ssh: { ...f.ssh, host: e.target.value } }))}
                          placeholder="vps.example.com"
                          required
                          className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-yellow-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] text-muted-foreground/60">port SSH</label>
                        <input
                          value={form.ssh.port}
                          onChange={(e) => setForm((f) => ({ ...f, ssh: { ...f.ssh, port: e.target.value } }))}
                          placeholder="22"
                          className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-yellow-500/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-muted-foreground/60">utilisateur SSH</label>
                      <input
                        value={form.ssh.user}
                        onChange={(e) => setForm((f) => ({ ...f, ssh: { ...f.ssh, user: e.target.value } }))}
                        placeholder="ubuntu"
                        required
                        className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-yellow-500/50"
                      />
                    </div>
                    <div className="flex gap-2">
                      {(["password", "key"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, ssh: { ...f.ssh, authMethod: m } }))}
                          className={`rounded border px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest transition ${
                            form.ssh.authMethod === m
                              ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                              : "border-dashed text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {m === "password" ? "mot de passe" : "clé privée"}
                        </button>
                      ))}
                    </div>
                    {form.ssh.authMethod === "password" ? (
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] text-muted-foreground/60">mot de passe SSH</label>
                        <input
                          value={form.ssh.password}
                          onChange={(e) => setForm((f) => ({ ...f, ssh: { ...f.ssh, password: e.target.value } }))}
                          type="password"
                          placeholder="••••••••"
                          className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-yellow-500/50"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] text-muted-foreground/60">clé privée (contenu du fichier .pem / id_rsa)</label>
                        <textarea
                          value={form.ssh.privateKey}
                          onChange={(e) => setForm((f) => ({ ...f, ssh: { ...f.ssh, privateKey: e.target.value } }))}
                          placeholder={"-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----"}
                          rows={5}
                          className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-[10px] text-foreground outline-none focus:border-yellow-500/50"
                        />
                      </div>
                    )}
                    <p className="font-mono text-[9px] text-muted-foreground/40">
                      Chiffrée AES-256 avant stockage — le tunnel est ouvert uniquement pendant le check
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Interval */}
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                intervalle
              </label>
              <select
                value={form.interval}
                onChange={(e) => setForm((f) => ({ ...f, interval: Number(e.target.value) }))}
                className="rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
              >
                <option value={1}>1 minute</option>
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            {/* Alert channel + role */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  salon_alerte (optionnel)
                </label>
                <input
                  value={form.alertChannelId}
                  onChange={(e) => setForm((f) => ({ ...f, alertChannelId: e.target.value }))}
                  placeholder="123456789012345678"
                  className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  rôle_alerte (optionnel)
                </label>
                <input
                  value={form.alertRoleId}
                  onChange={(e) => setForm((f) => ({ ...f, alertRoleId: e.target.value }))}
                  placeholder="123456789012345678"
                  className="w-full rounded border border-dashed bg-background px-3 py-1.5 font-mono text-xs text-foreground outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-blue-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 disabled:opacity-40"
              >
                <Plus className="size-3" />
                {submitting ? "création..." : "créer le monitor"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-dashed px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
              >
                annuler
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 transition hover:border-blue-500/30 hover:text-blue-400"
        >
          <Plus className="size-3.5" />
          ajouter un monitor
        </button>
      )}
    </div>
  );
}
