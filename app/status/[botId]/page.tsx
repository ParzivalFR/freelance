import { PublicFrame } from "@/components/public-frame";
import { getPublicStatus, type PublicStatus } from "@/lib/public-status";
import { notFound } from "next/navigation";

type MonitorCheck = PublicStatus["monitors"][number]["recentChecks"][number];

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
              ? "bg-[#5e9a76]"
              : c.status === "DOWN"
              ? "bg-[#c2513f]"
              : "bg-input"
          }`}
        />
      ))}
      {slots.length === 0 &&
        Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="h-5 flex-1 rounded-sm bg-muted" />
        ))}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  if (status === "UP") return <span className="inline-block size-2.5 rounded-full bg-[#5e9a76]" />;
  if (status === "DOWN") return <span className="inline-block size-2.5 rounded-full bg-[#c2513f]" />;
  return <span className="inline-block size-2.5 rounded-full bg-input" />;
}

function formatDuration(startedAt: Date, resolvedAt: Date | null): string {
  const start = new Date(startedAt).getTime();
  const end = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
  const mins = Math.floor((end - start) / 60_000);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h${mins % 60 > 0 ? ` ${mins % 60}min` : ""}`;
  return `${Math.floor(hours / 24)}j`;
}

// Lue en base à chaque visite : pas de base disponible pendant le build Docker.
export const dynamic = "force-dynamic";

export default async function StatusPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  const data = await getPublicStatus(botId);
  if (!data) notFound();

  const { bot, globalStatus, monitors } = data;

  const allIncidents = monitors
    .flatMap(m => m.incidents.map(i => ({ ...i, monitorName: m.name })))
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 10);

  return (
    <PublicFrame width="max-w-[760px]">
      <div>
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="note note-comment">page de statut</span>
            <h1 className="mt-4 text-[clamp(1.9rem,4.5vw,2.8rem)] font-extrabold leading-[1.08]">{bot.name}</h1>
          </div>
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              globalStatus === "UP"
                ? "bg-[#dfeadf] text-[#2f5a40]"
                : globalStatus === "DOWN"
                ? "bg-[#f2dcd8] text-[#8a2f22]"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <StatusDot status={globalStatus} />
            {globalStatus === "UP"
              ? "Tous les services fonctionnent"
              : globalStatus === "DOWN"
              ? "Incident en cours"
              : "En attente de la première vérification"}
          </div>
        </div>

        {/* Monitors */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Services</h2>
          {monitors.length === 0 && (
            <p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
              Aucune surveillance configurée pour ce bot.
            </p>
          )}
          {monitors.map((m) => (
            <div
              key={m.id}
              className="space-y-3 rounded-2xl border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot status={m.status} />
                  <span className="font-medium text-sm">{m.name}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase text-muted-foreground">
                    {m.type}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  {m.uptime30d !== null && (
                    <span>
                      <span className="font-semibold text-foreground">{m.uptime30d}%</span>
                      {" "}sur 30 jours
                    </span>
                  )}
                  {m.uptime7d !== null && (
                    <span>
                      <span className="font-semibold text-foreground">{m.uptime7d}%</span>
                      {" "}sur 7 jours
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
                  <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>30 dernières vérifications</span>
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
            <h2 className="text-xl font-bold">Incidents récents</h2>
            <div className="space-y-2">
              {allIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border bg-card p-5"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {inc.resolvedAt ? (
                        <span>Résolu</span>
                      ) : (
                        <span className="text-[#8a2f22]">En cours</span>
                      )}{" "}
                      · {inc.monitorName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Débuté le {new Date(inc.startedAt).toLocaleString("fr-FR")}
                      {inc.resolvedAt && (
                        <> · Résolu le {new Date(inc.resolvedAt).toLocaleString("fr-FR")}</>
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 font-[family-name:var(--font-jetbrains)] text-xs ${
                      inc.resolvedAt
                        ? "bg-muted text-muted-foreground"
                        : "bg-[#f2dcd8] text-[#8a2f22]"
                    }`}
                  >
                    {formatDuration(inc.startedAt, inc.resolvedAt)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="mt-12 text-xs text-muted-foreground">
          Vérifications automatiques à intervalle régulier. Surveillance assurée par gael-dev.fr.
        </p>
      </div>
    </PublicFrame>
  );
}
