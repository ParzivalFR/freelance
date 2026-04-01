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

interface NewMonitorForm {
  name: string;
  type: "HTTP" | "TCP" | "PING" | "POSTGRES" | "MYSQL" | "MARIADB";
  target: string;
  dbFields: DbFields;
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

  const [form, setForm] = useState<NewMonitorForm>({
    name: "",
    type: "HTTP",
    target: "",
    dbFields: EMPTY_DB_FIELDS,
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
      const res = await fetch("/api/bot/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, name: form.name, type: form.type, target, interval: form.interval, alertChannelId: form.alertChannelId, alertRoleId: form.alertRoleId }),
      });
      if (res.ok) {
        setForm({ name: "", type: "HTTP", target: "", dbFields: EMPTY_DB_FIELDS, interval: 5, alertChannelId: "", alertRoleId: "" });
        setShowForm(false);
        await fetchMonitors();
      }
    } finally {
      setSubmitting(false);
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

                {/* Response time */}
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="font-mono text-[10px] text-foreground">
                    {monitor.responseTime !== null ? `${monitor.responseTime}ms` : "—"}
                  </p>
                  <p className="font-mono text-[9px] text-muted-foreground/50">
                    {uptime}% uptime
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
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
                <div className="flex items-center gap-0.5 border-t border-dashed px-3 py-2">
                  <span className="mr-2 font-mono text-[8px] text-muted-foreground/40">
                    30 derniers checks
                  </span>
                  {last30.map((check, i) => (
                    <div
                      key={`${check.id}-${i}`}
                      title={`${check.status} — ${new Date(check.checkedAt).toLocaleString("fr-FR")}${
                        check.responseTime !== null ? ` — ${check.responseTime}ms` : ""
                      }`}
                      className={`h-4 w-1.5 rounded-sm ${getStatusColor(check.status)} opacity-80`}
                    />
                  ))}
                  {last30.length < 30 &&
                    Array.from({ length: 30 - last30.length }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="h-4 w-1.5 rounded-sm bg-muted-foreground/10"
                      />
                    ))}
                </div>
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
                      <span>{uptime}% uptime</span>
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
                    onClick={() => setForm((f) => ({ ...f, type: t, target: "", dbFields: EMPTY_DB_FIELDS }))}
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
