import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { FolderOpen, Users, MessageSquare, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  // Récupérer les statistiques
  const [projectsCount, clientsCount, testimonialsCount] = await Promise.all([
    prisma.project.count(),
    prisma.client.count(),
    prisma.testimonial.count(),
  ]);

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
      value: "24%",
      icon: TrendingUp,
      description: "Visiteurs → Contacts",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre activité freelance
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Derniers Projets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gérez votre portfolio facilement
            </p>
            <Badge variant="outline">
              {projectsCount} projet{projectsCount > 1 ? 's' : ''} en ligne
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestion Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Suivez vos prospects et clients
            </p>
            <Badge variant="outline">
              {clientsCount} client{clientsCount > 1 ? 's' : ''} enregistré{clientsCount > 1 ? 's' : ''}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Témoignages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Avis et retours clients
            </p>
            <Badge variant="outline">
              {testimonialsCount} témoignage{testimonialsCount > 1 ? 's' : ''} publié{testimonialsCount > 1 ? 's' : ''}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}