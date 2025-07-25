import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { 
  BarChart3, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Users, 
  Calendar,
  Globe,
  Clock
} from "lucide-react";

export default async function AnalyticsPage() {
  // Récupérer les données d'analytics
  const [
    totalProjects,
    totalClients,
    totalTestimonials,
    recentClients
  ] = await Promise.all([
    prisma.project.count(),
    prisma.client.count(),
    prisma.testimonial.count(),
    prisma.client.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        firstName: true,
        lastName: true,
        createdAt: true,
        status: true
      }
    })
  ]);

  // Données fictives pour les statistiques web (à remplacer par des données réelles)
  const webStats = [
    {
      title: "Visiteurs uniques",
      value: "2,847",
      change: "+12.5%",
      icon: Users,
      color: "text-blue-600",
      trend: "up"
    },
    {
      title: "Pages vues",
      value: "8,421",
      change: "+8.2%",
      icon: Eye,
      color: "text-green-600",
      trend: "up"
    },
    {
      title: "Taux de rebond",
      value: "34.2%",
      change: "-2.1%",
      icon: MousePointer,
      color: "text-purple-600",
      trend: "down"
    },
    {
      title: "Temps moyen",
      value: "3m 24s",
      change: "+5.3%",
      icon: Clock,
      color: "text-orange-600",
      trend: "up"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="mt-2 text-muted-foreground">
              Analysez les performances de votre site et votre activité
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-card-foreground shadow-sm">
            <div className="mr-2 size-2 animate-pulse rounded-full bg-green-500"></div>
            Données en temps réel
          </div>
        </div>
      </div>

      {/* Statistiques Web */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Trafic du site web</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {webStats.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden border shadow-sm">
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
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <div className="mt-1 flex items-center text-xs">
                  <TrendingUp className={`mr-1 size-3 ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`} />
                  <span className={
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }>
                    {stat.change}
                  </span>
                  <span className="ml-1 text-muted-foreground">vs mois dernier</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Statistiques Business */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Activité business</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="relative overflow-hidden border shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-card dark:from-blue-950/20"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <BarChart3 className="size-5" />
                </div>
                <div>
                  <div className="font-semibold">Projets</div>
                  <div className="text-sm font-normal text-muted-foreground">
                    Total réalisés
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold tracking-tight">{totalProjects}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Projets complétés cette année
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-card dark:from-green-950/20"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                  <Users className="size-5" />
                </div>
                <div>
                  <div className="font-semibold">Clients</div>
                  <div className="text-sm font-normal text-muted-foreground">
                    Base de données
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold tracking-tight">{totalClients}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Clients enregistrés
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-card dark:from-purple-950/20"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                  <Globe className="size-5" />
                </div>
                <div>
                  <div className="font-semibold">Témoignages</div>
                  <div className="text-sm font-normal text-muted-foreground">
                    Avis clients
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold tracking-tight">{totalTestimonials}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Avis publiés
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activité récente */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Activité récente</h2>
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Nouveaux clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClients.length > 0 ? (
                recentClients.map((client, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                        {client.firstName?.[0]}{client.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-medium">
                          {client.firstName} {client.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                      {client.status || 'nouveau'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">
                  Aucun nouveau client récemment
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}