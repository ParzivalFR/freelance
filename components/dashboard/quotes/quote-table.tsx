"use client";

import { updateQuoteStatus } from "@/app/actions/quotes";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Copy,
  Download,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { QuoteViewer } from "./quote-viewer";
import { SimplePDFButton } from "./simple-pdf-button";

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

interface QuotesTableProps {
  quotes: Quote[];
}

const statusConfig = {
  DRAFT: { label: "Brouillon", variant: "secondary" as const, color: "gray" },
  SENT: { label: "Envoyé", variant: "default" as const, color: "blue" },
  ACCEPTED: { label: "Accepté", variant: "default" as const, color: "green" },
  REJECTED: { label: "Refusé", variant: "destructive" as const, color: "red" },
  EXPIRED: { label: "Expiré", variant: "outline" as const, color: "orange" },
};

export function QuotesTable({ quotes }: QuotesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer les devis en fonction du terme de recherche
  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié dans le presse-papiers`);
  };

  const handleStatusChange = async (
    quoteId: string,
    newStatus: Quote["status"]
  ) => {
    try {
      await updateQuoteStatus(quoteId, newStatus);
      toast.success("Statut mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const isExpired = (validUntil: Date) => {
    return new Date() > new Date(validUntil);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Devis ({quotes.length})</CardTitle>
            <CardDescription>
              Gérez vos devis et suivez leur statut
            </CardDescription>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredQuotes.length === 0 ? (
          <div className="py-8 text-center">
            <FileText className="mx-auto size-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Aucun devis
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Aucun devis ne correspond à votre recherche."
                : "Commencez par créer un nouveau devis."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Montant TTC</TableHead>
                  <TableHead>Valide jusqu'au</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium">{quote.quoteNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {quote.items.length} prestation
                          {quote.items.length > 1 ? "s" : ""}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium">
                          {quote.client.firstName} {quote.client.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {quote.client.email}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={statusConfig[quote.status].variant}
                        className={`${
                          quote.status === "ACCEPTED"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : quote.status === "REJECTED"
                            ? "bg-red-100 text-red-800 hover:bg-red-200"
                            : quote.status === "SENT"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            : quote.status === "EXPIRED"
                            ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                            : ""
                        }`}
                      >
                        {statusConfig[quote.status].label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(quote.totalAmount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        HT: {formatCurrency(quote.subtotal)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div
                        className={`${
                          isExpired(quote.validUntil) ? "text-red-600" : ""
                        }`}
                      >
                        {formatDate(quote.validUntil)}
                      </div>
                      {isExpired(quote.validUntil) && (
                        <div className="text-sm text-red-500">Expiré</div>
                      )}
                    </TableCell>

                    <TableCell>{formatDate(quote.createdAt)}</TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="size-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>

                          <DropdownMenuItem
                            onClick={() =>
                              copyToClipboard(
                                quote.quoteNumber,
                                "Numéro de devis"
                              )
                            }
                          >
                            <Copy className="mr-2 size-4" />
                            Copier le numéro
                          </DropdownMenuItem>

                          <QuoteViewer quote={quote}>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Eye className="mr-2 size-4" />
                              Voir le détail
                            </DropdownMenuItem>
                          </QuoteViewer>

                          <SimplePDFButton
                            quote={quote}
                            variant="default"
                            className="w-full"
                          >
                            <Download className="mr-2 size-4" />
                            Télécharger PDF
                          </SimplePDFButton>

                          <DropdownMenuSeparator />

                          <DropdownMenuLabel>
                            Changer le statut
                          </DropdownMenuLabel>

                          {quote.status !== "SENT" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(quote.id, "SENT")
                              }
                            >
                              Marquer comme envoyé
                            </DropdownMenuItem>
                          )}

                          {quote.status === "SENT" && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(quote.id, "ACCEPTED")
                                }
                              >
                                Marquer comme accepté
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(quote.id, "REJECTED")
                                }
                              >
                                Marquer comme refusé
                              </DropdownMenuItem>
                            </>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem>
                            <Edit className="mr-2 size-4" />
                            Modifier
                          </DropdownMenuItem>

                          <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 size-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
