// components/dashboard/quotes-stats.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Clock,
  Euro,
  FileText,
  Send,
  TrendingUp,
  XCircle,
} from "lucide-react";

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Client {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  isProfessional: boolean;
}

interface Quote {
  id: string;
  quoteNumber: string;
  client: Client;
  items: QuoteItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  validUntil: Date;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface QuotesStatsProps {
  quotes: Quote[];
}

export function QuotesStats({ quotes }: QuotesStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const calculateStats = () => {
    const totalQuotes = quotes.length;
    const totalAmount = quotes.reduce(
      (sum, quote) => sum + quote.totalAmount,
      0
    );

    const statusCounts = quotes.reduce((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const acceptedAmount = quotes
      .filter((quote) => quote.status === "ACCEPTED")
      .reduce((sum, quote) => sum + quote.totalAmount, 0);

    const conversionRate =
      totalQuotes > 0
        ? (((statusCounts.ACCEPTED || 0) / totalQuotes) * 100).toFixed(1)
        : "0";

    // Statistiques par mois (derniers 6 mois)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const recentQuotes = quotes.filter(
      (quote) => new Date(quote.createdAt) >= sixMonthsAgo
    );

    const monthlyStats = recentQuotes.reduce((acc, quote) => {
      const month = new Date(quote.createdAt).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
      });

      if (!acc[month]) {
        acc[month] = { count: 0, amount: 0 };
      }

      acc[month].count++;
      acc[month].amount += quote.totalAmount;

      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    return {
      totalQuotes,
      totalAmount,
      acceptedAmount,
      conversionRate,
      statusCounts,
      monthlyStats,
    };
  };

  const stats = calculateStats();

  const statsCards = [
    {
      title: "Total Devis",
      value: stats.totalQuotes.toString(),
      description: "Nombre total de devis créés",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Montant Total",
      value: formatCurrency(stats.totalAmount),
      description: "Valeur totale des devis",
      icon: Euro,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Montant Accepté",
      value: formatCurrency(stats.acceptedAmount),
      description: "Revenus confirmés",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Taux de Conversion",
      value: `${stats.conversionRate}%`,
      description: "Devis acceptés / Total",
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const statusCards = [
    {
      status: "DRAFT",
      label: "Brouillons",
      count: stats.statusCounts.DRAFT || 0,
      icon: Clock,
      color: "text-gray-600",
      badgeVariant: "secondary" as const,
    },
    {
      status: "SENT",
      label: "Envoyés",
      count: stats.statusCounts.SENT || 0,
      icon: Send,
      color: "text-blue-600",
      badgeVariant: "default" as const,
    },
    {
      status: "ACCEPTED",
      label: "Acceptés",
      count: stats.statusCounts.ACCEPTED || 0,
      icon: CheckCircle,
      color: "text-green-600",
      badgeVariant: "default" as const,
    },
    {
      status: "REJECTED",
      label: "Refusés",
      count: stats.statusCounts.REJECTED || 0,
      icon: XCircle,
      color: "text-red-600",
      badgeVariant: "destructive" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                  <stat.icon className={`size-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistiques par statut */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par Statut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {statusCards.map((status, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3"
              >
                <status.icon className={`size-5 ${status.color}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {status.label}
                    </span>
                    <Badge variant={status.badgeVariant}>{status.count}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Évolution récente */}
      {Object.keys(stats.monthlyStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Évolution (6 derniers mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.monthlyStats)
                .sort(
                  ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
                )
                .map(([month, data]) => (
                  <div
                    key={month}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{month}</p>
                      <p className="text-sm text-gray-600">
                        {data.count} devis
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(data.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {data.count > 0
                          ? formatCurrency(data.amount / data.count)
                          : "0€"}{" "}
                        / devis
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
