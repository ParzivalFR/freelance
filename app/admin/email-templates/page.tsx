import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Mail, 
  Edit3, 
  Eye, 
  Copy,
  MessageSquare,
  UserPlus,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function EmailTemplatesPage() {
  // Templates d'email prédéfinis
  const emailTemplates = [
    {
      id: 1,
      name: "Demande de témoignage",
      description: "Email envoyé automatiquement pour demander un témoignage après un projet",
      category: "Témoignages",
      status: "active",
      lastModified: "2024-01-15",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      id: 2,
      name: "Bienvenue nouveau client",
      description: "Email de bienvenue envoyé lors de l'inscription d'un nouveau client",
      category: "Onboarding",
      status: "active",
      lastModified: "2024-01-10",
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      id: 3,
      name: "Confirmation de projet",
      description: "Email de confirmation envoyé quand un projet est accepté",
      category: "Projets",
      status: "active",
      lastModified: "2024-01-08",
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      id: 4,
      name: "Relance témoignage",
      description: "Email de relance pour les témoignages non complétés",
      category: "Témoignages",
      status: "draft",
      lastModified: "2024-01-05",
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    }
  ];

  const categories = ["Tous", "Témoignages", "Onboarding", "Projets"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Templates Email</h1>
            <p className="mt-2 text-muted-foreground">
              Gérez vos modèles d'emails automatisés
            </p>
          </div>
          <Button>
            <Mail className="mr-2 size-4" />
            Nouveau template
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={category === "Tous" ? "default" : "outline"}
            size="sm"
            className="h-8"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {emailTemplates.map((template) => (
          <Card key={template.id} className="relative overflow-hidden border shadow-sm">
            <div className={`absolute inset-0 ${template.bgColor}`}></div>
            <CardHeader className="relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg bg-white p-2 shadow-sm ${template.color}`}>
                    <template.icon className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {template.name}
                    </CardTitle>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge 
                        variant={template.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {template.status === 'active' ? 'Actif' : 'Brouillon'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {template.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Modifié le {new Date(template.lastModified).toLocaleDateString('fr-FR')}
                </span>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="size-8 p-0">
                    <Eye className="size-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="size-8 p-0">
                    <Edit3 className="size-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="size-8 p-0">
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistiques des emails */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Statistiques d'envoi</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Emails envoyés
              </CardTitle>
              <Mail className="size-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">1,847</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Ce mois-ci
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taux d'ouverture
              </CardTitle>
              <Eye className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">67.2%</div>
              <p className="mt-1 text-xs text-muted-foreground">
                +2.1% vs mois dernier
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taux de clic
              </CardTitle>
              <Copy className="size-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">24.8%</div>
              <p className="mt-1 text-xs text-muted-foreground">
                +1.3% vs mois dernier
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Désabonnements
              </CardTitle>
              <AlertCircle className="size-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">0.8%</div>
              <p className="mt-1 text-xs text-muted-foreground">
                -0.2% vs mois dernier
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Note d'information */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Templates automatisés
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-200">
                Les templates actifs sont automatiquement envoyés selon vos règles configurées. 
                Vous pouvez les modifier à tout moment sans affecter les emails déjà programmés.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}