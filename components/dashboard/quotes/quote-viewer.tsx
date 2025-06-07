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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import { UnifiedPDFSelector } from "./unified-pdf-selector";
import { UpdatedSimplePDFButton } from "./updated-simple-pdf-button";
interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Client {
  id: string;
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

interface QuoteViewerProps {
  quote: Quote;
  children?: React.ReactNode;
}

const statusConfig = {
  DRAFT: { label: "Brouillon", variant: "secondary" as const },
  SENT: { label: "Envoyé", variant: "default" as const },
  ACCEPTED: { label: "Accepté", variant: "default" as const },
  REJECTED: { label: "Refusé", variant: "destructive" as const },
  EXPIRED: { label: "Expiré", variant: "outline" as const },
};

export function QuoteViewer({ quote, children }: QuoteViewerProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Eye className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Devis {quote.quoteNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête du devis */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Informations de l'entreprise */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gaël Richard</CardTitle>
                <CardDescription>Développeur Freelance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>7 rue du pré de la ramée</p>
                <p>44550 Montoir De Bretagne</p>
                <p>SIRET: 93044860000013</p>
                <p>Email: gael_pro@ik.me</p>
                <p>Tél: +33 6 33 36 40 94</p>
              </CardContent>
            </Card>

            {/* Informations du client */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">
                  {quote.client.firstName} {quote.client.lastName}
                </p>
                <p>{quote.client.email}</p>
                {quote.client.phone && <p>{quote.client.phone}</p>}
                {quote.client.address && <p>{quote.client.address}</p>}
                <Badge
                  variant={
                    quote.client.isProfessional ? "default" : "secondary"
                  }
                >
                  {quote.client.isProfessional
                    ? "Professionnel"
                    : "Particulier"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Informations du devis */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                <div>
                  <p className="font-medium">Numéro de devis</p>
                  <p>{quote.quoteNumber}</p>
                </div>
                <div>
                  <p className="font-medium">Date de création</p>
                  <p>{formatDate(quote.createdAt)}</p>
                </div>
                <div>
                  <p className="font-medium">Valide jusqu'au</p>
                  <p>{formatDate(quote.validUntil)}</p>
                </div>
                <div>
                  <p className="font-medium">Statut</p>
                  <Badge variant={statusConfig[quote.status].variant}>
                    {statusConfig[quote.status].label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Détail des prestations */}
          <Card>
            <CardHeader>
              <CardTitle>Prestations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Quantité</TableHead>
                    <TableHead className="text-right">Prix unitaire</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Totaux */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total HT :</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA ({quote.vatRate}%) :</span>
                  <span>{formatCurrency(quote.vatAmount)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total TTC :</span>
                  <span>{formatCurrency(quote.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {quote.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{quote.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            {/* <SimpleDownloadButton quote={quote} /> */}
            {/* <UnifiedPDFSelector quote={quote} variant="outline" /> */}
            <UpdatedSimplePDFButton quote={quote} />
            {/* <PDFStyleSelector quote={quote} /> */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
