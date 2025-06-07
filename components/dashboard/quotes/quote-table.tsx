// components/dashboard/quotes/quote-table.tsx
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
  formatCurrency,
  formatDate,
  isExpired,
  Quote,
  QuoteStatus,
  statusConfig,
} from "@/types/QuoteTypes";
import {
  Copy,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PDFStyleSelector } from "./pdf-style-selector";
import { QuoteViewer } from "./quote-viewer";

interface QuotesTableProps {
  quotes: Quote[];
}

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié dans le presse-papiers`);
  };

  const handleStatusChange = async (
    quoteId: string,
    newStatus: QuoteStatus
  ) => {
    try {
      await updateQuoteStatus(quoteId, newStatus);
      toast.success("Statut mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
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

                          <DropdownMenuItem asChild>
                            <div className="flex items-center">
                              {/* <SimpleDownloadButton quote={quote} /> */}
                              <PDFStyleSelector quote={quote} />
                            </div>
                          </DropdownMenuItem>

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
