// app/dashboard/quotes/[id]/page.tsx
import { getQuoteById } from "@/app/actions/quotes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuoteStatus } from "@prisma/client";
import { ArrowLeft, Download, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface QuoteDetailPageProps {
  params: { id: string };
}

const statusConfig = {
  [QuoteStatus.DRAFT]: {
    label: "Brouillon",
    variant: "secondary" as const,
    color: "bg-gray-500",
  },
  [QuoteStatus.SENT]: {
    label: "Envoyé",
    variant: "default" as const,
    color: "bg-blue-500",
  },
  [QuoteStatus.ACCEPTED]: {
    label: "Accepté",
    variant: "default" as const,
    color: "bg-green-500",
  },
  [QuoteStatus.REJECTED]: {
    label: "Refusé",
    variant: "destructive" as const,
    color: "bg-red-500",
  },
  [QuoteStatus.EXPIRED]: {
    label: "Expiré",
    variant: "secondary" as const,
    color: "bg-orange-500",
  },
  [QuoteStatus.CANCELLED]: {
    label: "Annulé",
    variant: "secondary" as const,
    color: "bg-gray-400",
  },
};

export default async function QuoteDetailPage({
  params,
}: QuoteDetailPageProps) {
  const quote = await getQuoteById(params.id);

  if (!quote) {
    notFound();
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const isExpired =
    quote.validUntil &&
    new Date() > new Date(quote.validUntil) &&
    quote.status === QuoteStatus.SENT;

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/quotes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{quote.number}</h1>
            <p className="text-muted-foreground">{quote.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                statusConfig[quote.status as keyof typeof statusConfig].color
              }`}
            />
            <Badge
              variant={
                statusConfig[quote.status as keyof typeof statusConfig].variant
              }
            >
              {statusConfig[quote.status as keyof typeof statusConfig].label}
            </Badge>
            {isExpired && <Badge variant="destructive">Expiré</Badge>}
          </div>

          {quote.status !== QuoteStatus.ACCEPTED && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/quotes/${quote.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
          )}

          <Button size="sm" asChild>
            <Link href={`/dashboard/quotes/${quote.id}/pdf`}>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations client */}
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="font-medium">
                {quote.client.firstName} {quote.client.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
                {quote.client.email}
              </div>
              {quote.client.phone && (
                <div className="text-sm text-muted-foreground">
                  {quote.client.phone}
                </div>
              )}
              {quote.client.address && (
                <div className="text-sm text-muted-foreground">
                  {quote.client.address}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informations devis */}
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Créé le</div>
                <div className="text-muted-foreground">
                  {formatDate(quote.createdAt)}
                </div>
              </div>
              <div>
                <div className="font-medium">Valide jusqu'au</div>
                <div
                  className={`text-muted-foreground ${
                    isExpired ? "text-red-600" : ""
                  }`}
                >
                  {formatDate(quote.validUntil)}
                </div>
              </div>
              {quote.sentAt && (
                <div>
                  <div className="font-medium">Envoyé le</div>
                  <div className="text-muted-foreground">
                    {formatDate(quote.sentAt)}
                  </div>
                </div>
              )}
              {quote.acceptedAt && (
                <div>
                  <div className="font-medium">Accepté le</div>
                  <div className="text-muted-foreground">
                    {formatDate(quote.acceptedAt)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {quote.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{quote.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Prestations */}
      <Card>
        <CardHeader>
          <CardTitle>Prestations</CardTitle>
          <CardDescription>
            Détail des prestations incluses dans ce devis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prestation</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Prix unitaire HT</TableHead>
                <TableHead className="text-right">Total HT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items.map(
                (item: {
                  id: string;
                  title: string;
                  description?: string;
                  quantity: number;
                  unit: string;
                  unitPrice: number;
                  totalPrice: number;
                }) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(item.quantity)} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(Number(item.unitPrice))}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(Number(item.totalPrice))}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Totaux */}
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Sous-total HT :</span>
              <span className="font-medium">
                {formatPrice(Number(quote.subtotalHT))}
              </span>
            </div>
            <div className="flex justify-between">
              <span>TVA ({Number(quote.taxRate)}%) :</span>
              <span className="font-medium">
                {formatPrice(Number(quote.taxAmount))}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total TTC :</span>
              <span>{formatPrice(Number(quote.totalTTC))}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditions */}
      <div className="grid gap-6 md:grid-cols-2">
        {quote.paymentTerms && (
          <Card>
            <CardHeader>
              <CardTitle>Conditions de paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {quote.paymentTerms}
              </p>
            </CardContent>
          </Card>
        )}

        {quote.deliveryTerms && (
          <Card>
            <CardHeader>
              <CardTitle>Conditions de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {quote.deliveryTerms}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notes */}
      {quote.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes additionnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
