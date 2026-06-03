import { notFound } from "next/navigation";

interface MonitorCheck {
  status: string;
  checkedAt: string;
}

interface Incident {
  id: string;
  startedAt: string;
  resolvedAt: string | null;
}

interface PublicMonitor {
  id: string;
  name: string;
  type: string;
  status: string;
  lastCheckedAt: string | null;
  responseTime: number | null;
  uptime7d: number | null;
  uptime30d: number | null;
  recentChecks: MonitorCheck[];
  incidents: Incident[];
}

interface StatusData {
  bot: { id: string; name: string };
  globalStatus: "UP" | "DOWN" | "PENDING";
  monitors: PublicMonitor[];
}

async function getStatusData(botId: string): Promise<StatusData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/public/status/${botId}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) return null;
  return res.json();
}

function UptimeBar({ checks }: { checks: MonitorCheck[] }) {
  const slots = [...checks].reverse();
  return (
    <div className="flex gap-px">
      {slots.map((c, i) => (
        <div
          key={i}
          title={`${c.status} — ${new Date(c.checkedAt).toLocaleString("fr-FR")}`}
          className={`h-5 flex-1 rounded-sm ${
            c.status === "UP"
              ? "bg-emerald-500"
              : c.status === "DOWN"
              ? "bg-red-500"
              : "bg-zinc-600"
          }`}
        />
      ))}
      {slots.length === 0 &&
        Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="h-5 flex-1 rounded-sm bg-zinc-700" />
        ))}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  if (status === "UP") return <span className="inline-block size-2.5 rounded-full bg-emerald-500" />;
  if (status === "DOWN") return <span className="inline-block size-2.5 rounded-full bg-red-500" />;
  return <span className="inline-block size-2.5 rounded-full bg-zinc-500" />;
}

function formatDuration(startedAt: string, resolvedAt: string | null): string {
  const start = new Date(startedAt).getTime();
  const end = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
  const mins = Math.floor((end - start) / 60_000);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h${mins % 60 > 0 ? ` ${mins % 60}min` : ""}`;
  return `${Math.floor(hours / 24)}j`;
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  const data = await getStatusData(botId);
  if (!data) notFound();

  const { bot, globalStatus, monitors } = data;

  const allIncidents = monitors
    .flatMap(m => m.incidents.map(i => ({ ...i, monitorName: m.name })))
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <div className="mx-auto max-w-3xl px-4 py-12">

        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{bot.name}</h1>
            <p className="mt-1 text-sm text-zinc-400">Page de statut publique</p>
          </div>
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
              globalStatus === "UP"
                ? "bg-emerald-500/10 text-emerald-400"
                : globalStatus === "DOWN"
                ? "bg-red-500/10 text-red-400"
                : "bg-zinc-700/50 text-zinc-400"
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                globalStatus === "UP"
                  ? "bg-emerald-500"
                  : globalStatus === "DOWN"
                  ? "bg-red-500"
                  : "bg-zinc-500"
              }`}
            />
            {globalStatus === "UP"
              ? "Tous les services opérationnels"
              : globalStatus === "DOWN"
              ? "Incident en cours"
              : "En attente"}
          </div>
        </div>

        {/* Monitors */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Services
          </h2>
          {monitors.length === 0 && (
            <p className="rounded-xl border border-zinc-800 p-6 text-center text-sm text-zinc-500">
              Aucun monitor configuré.
            </p>
          )}
          {monitors.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot status={m.status} />
                  <span className="font-medium text-sm">{m.name}</span>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 uppercase">
                    {m.type}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  {m.uptime30d !== null && (
                    <span>
                      <span className="text-zinc-300 font-semibold">{m.uptime30d}%</span>
                      {" "}uptime 30j
                    </span>
                  )}
                  {m.uptime7d !== null && (
                    <span>
                      <span className="text-zinc-300 font-semibold">{m.uptime7d}%</span>
                      {" "}uptime 7j
                    </span>
                  )}
                  {m.responseTime !== null && (
                    <span>{m.responseTime} ms</span>
                  )}
                </div>
              </div>
              {m.recentChecks.length > 0 && (
                <div>
                  <UptimeBar checks={m.recentChecks} />
                  <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
                    <span>30 derniers checks</span>
                    {m.lastCheckedAt && (
                      <span>
                        Vérifié {new Date(m.lastCheckedAt).toLocaleString("fr-FR")}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Incidents récents */}
        {allIncidents.length > 0 && (
          <section className="mt-10 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Incidents récents
            </h2>
            <div className="space-y-2">
              {allIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {inc.resolvedAt ? (
                        <span className="text-zinc-300">Résolu</span>
                      ) : (
                        <span className="text-red-400">En cours</span>
                      )}{" "}
                      — {inc.monitorName}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Débuté le {new Date(inc.startedAt).toLocaleString("fr-FR")}
                      {inc.resolvedAt && (
                        <> · Résolu le {new Date(inc.resolvedAt).toLocaleString("fr-FR")}</>
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-xs font-mono ${
                      inc.resolvedAt
                        ? "bg-zinc-800 text-zinc-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {formatDuration(inc.startedAt, inc.resolvedAt)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-zinc-600">
          Propulsé par <span className="text-zinc-500">Fleetly</span>
        </footer>
      </div>
    </div>
  );
}
