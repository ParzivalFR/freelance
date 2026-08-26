import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader, SectionTitle } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  calculateChangePercent,
  formatNumber,
  formatVisitDuration,
  getPlausibleComparison,
  getPlausibleStats,
} from "@/lib/plausible";
import { prisma } from "@/lib/prisma";
import {
  Clock,
  Eye,
  FolderOpen,
  MessageSquare,
  MousePointer,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

export default async function AnalyticsPage() {
  const [
    totalProjects,
    totalClients,
    totalTestimonials,
    recentClients,
    plausibleStats,
    plausibleComparison,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.client.count(),
    prisma.testimonial.count(),
    prisma.client.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        firstName: true,
        lastName: true,
        createdAt: true,
        status: true,
      },
    }),
    getPlausibleStats("30d"),
    getPlausibleComparison("30d"),
  ]);

  /**
   * Plausible renvoie la valeur courante et celle de la période précédente.
   * `betterWhenLower` inverse la lecture pour le taux de rebond, où une
   * baisse est une bonne nouvelle.
   */
  const buildTrend = (
    metric: "visitors" | "pageviews" | "bounce_rate" | "visit_duration",
    betterWhenLower = false
  ) => {
    const entry = plausibleComparison?.[metric];
    if (!entry) return null;
    const change = entry.change ?? 0;
    return {
      label: calculateChangePercent(
        entry.value,
        entry.comparison_value ?? entry.value
      ),
      positive: betterWhenLower ? change <= 0 : change >= 0,
    };
  };

  const webStats = [
    {
      label: "Visiteurs uniques",
      value: plausibleStats ? formatNumber(plausibleStats.visitors.value) : "—",
      icon: Users,
      trend: buildTrend("visitors"),
    },
    {
      label: "Pages vues",
      value: plausibleStats ? formatNumber(plausibleStats.pageviews.value) : "—",
      icon: Eye,
      trend: buildTrend("pageviews"),
    },
    {
      label: "Taux de rebond",
      value: plausibleStats ? `${plausibleStats.bounce_rate.value}%` : "—",
      icon: MousePointer,
      trend: buildTrend("bounce_rate", true),
    },
    {
      label: "Temps moyen",
      value: plausibleStats
        ? formatVisitDuration(plausibleStats.visit_duration.value)
        : "—",
      icon: Clock,
      trend: buildTrend("visit_duration"),
    },
  ];

  const businessStats = [
    {
      label: "Projets",
      value: totalProjects,
      sub: "Réalisations en ligne",
      icon: FolderOpen,
    },
    {
      label: "Clients",
      value: totalClients,
      sub: "Fiches dans le CRM",
      icon: Users,
    },
    {
      label: "Témoignages",
      value: totalTestimonials,
      sub: "Avis publiés",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader
        eyebrow="Ce que disent les chiffres"
        title="Analy"
        titleAccent="tics"
        description="Le trafic du site sur les 30 derniers jours, comparé au mois précédent, et l'état de votre activité."
        actions={
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <span
              className={`size-2 rounded-full ${
                plausibleStats ? "animate-pulse bg-green-500" : "bg-muted-foreground/40"
              }`}
            />
            {plausibleStats ? "Plausible connecté" : "Plausible indisponible"}
          </span>
        }
      />

      <div className="space-y-4">
        <SectionTitle>Trafic du site</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {webStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <div className="rounded-lg bg-muted/60 p-2 text-muted-foreground">
                  <stat.icon className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                {stat.value}
              </p>
              {stat.trend ? (
                <p className="mt-1 flex items-center gap-1 text-xs">
                  {stat.trend.positive ? (
                    <TrendingUp className="size-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="size-3 text-red-600 dark:text-red-400" />
                  )}
                  <span
                    className={
                      stat.trend.positive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {stat.trend.label}
                  </span>
                  <span className="text-muted-foreground">vs mois dernier</span>
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Comparaison indisponible
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Votre activité</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {businessStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Derniers contacts</SectionTitle>
        {recentClients.length > 0 ? (
          <div className="divide-y rounded-2xl border bg-card">
            {recentClients.map((client, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#7158ff]/10 text-xs font-semibold uppercase text-[#7158ff]">
                    {client.firstName?.[0]}
                    {client.lastName?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(client.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Badge variant={client.status === "active" ? "default" : "secondary"}>
                  {client.status || "nouveau"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={UserPlus}
            title="Aucun contact récent"
            description="Les demandes envoyées depuis le formulaire de la landing apparaîtront ici."
          />
        )}
      </div>
    </div>
  );
}
