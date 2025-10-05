import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getPlausibleStats, calculateChangePercent } from "@/lib/plausible";
import { FolderOpen, MessageSquare, TrendingUp, Users } from "lucide-react";

export default async function AdminDashboard() {
  // Récupérer les statistiques
  const [projectsCount, clientsCount, testimonialsCount, recentClients, plausibleStats] = await Promise.all([
    prisma.project.count(),
    prisma.client.count(),
    prisma.testimonial.count(),
    prisma.client.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
      }
    }),
    getPlausibleStats("30d"),
  ]);

  // Calculer les clients récents (dernière semaine)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentClientsCount = recentClients.filter(
    client => new Date(client.createdAt) > oneWeekAgo
  ).length;

  // Calculer le taux de conversion approximatif (contacts/visiteurs)
  const contactsCount = await prisma.client.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30))
      }
    }
  });
  const conversionRate = plausibleStats && plausibleStats.visitors.value > 0
    ? ((contactsCount / plausibleStats.visitors.value) * 100).toFixed(1)
    : "0";

  const stats = [
    {
      title: "Projets",
      value: projectsCount,
      icon: FolderOpen,
      description: "Projets réalisés",
      color: "text-blue-600",
    },
    {
      title: "Clients",
      value: clientsCount,
      icon: Users,
      description: "Clients enregistrés",
      color: "text-green-600",
    },
    {
      title: "Témoignages",
      value: testimonialsCount,
      icon: MessageSquare,
      description: "Avis clients",
      color: "text-purple-600",
    },
    {
      title: "Taux de conversion",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      description: "Visiteurs → Contacts",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header avec style Origin UI */}
      <div className="border-b border-border/40 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard Admin
            </h1>
            <p className="mt-2 text-muted-foreground">
              Vue d'ensemble de votre activité freelance
            </p>
          </div>
          <div className="shadow-sm inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-card-foreground">
            <div className="mr-2 size-2 animate-pulse rounded-full bg-green-500"></div>
            En ligne
          </div>
        </div>
      </div>

      {/* Statistics Cards avec style amélioré */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="shadow-sm relative overflow-hidden border"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-card to-card/50"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg bg-muted p-2 ${stat.color}`}>
                <stat.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold tracking-tight">
                {stat.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions avec design moderne */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm relative overflow-hidden border">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-card dark:from-blue-950/20"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <FolderOpen className="size-5" />
              </div>
              <div>
                <div className="font-semibold">Portfolio</div>
                <div className="text-sm font-normal text-muted-foreground">
                  Gérez vos projets
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
              >
                {projectsCount} projet{projectsCount > 1 ? "s" : ""} en ligne
              </Badge>
              <div className="text-xs text-muted-foreground">
                Dernière mise à jour: Aujourd'hui
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm relative overflow-hidden border">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-card dark:from-green-950/20"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                <Users className="size-5" />
              </div>
              <div>
                <div className="font-semibold">Clients</div>
                <div className="text-sm font-normal text-muted-foreground">
                  Base de données clients
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300"
              >
                {clientsCount} client{clientsCount > 1 ? "s" : ""} enregistré
                {clientsCount > 1 ? "s" : ""}
              </Badge>
              <div className="text-xs text-muted-foreground">
                +{recentClientsCount} cette semaine
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm relative overflow-hidden border">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-card dark:from-purple-950/20"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <div className="font-semibold">Témoignages</div>
                <div className="text-sm font-normal text-muted-foreground">
                  Avis et retours clients
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300"
              >
                {testimonialsCount} témoignage{testimonialsCount > 1 ? "s" : ""}{" "}
                publié{testimonialsCount > 1 ? "s" : ""}
              </Badge>
              <div className="text-xs text-muted-foreground">
                {testimonialsCount > 0 ? "5/5 moyenne" : "Aucun avis"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
