// components/dashboard/quotes-table.tsx
"use client";

import { duplicateQuote, updateQuoteStatus } from "@/app/actions/quotes";
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
import { QuoteStatus } from "@prisma/client";
import {
  Copy,
  Download,
  Edit,
  Eye,
  FileText,
  Mail,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteQuoteDialog } from "./dialog-delete-quote";

interface Quote {
  id: string;
  number: string;
  title: string;
  status: QuoteStatus;
  totalTTC: number;
  validUntil: Date | null;
  createdAt: Date;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface QuotesTableProps {
  quotes: Quote[];
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

export function QuotesTable({ quotes }: QuotesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Filtrer les devis
  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${quote.client.firstName} ${quote.client.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const isExpiredQuote = (quote: Quote) => {
    if (!quote.validUntil) return false;
    return (
      new Date() > new Date(quote.validUntil) &&
      quote.status === QuoteStatus.SENT
    );
  };

  const handleStatusChange = async (
    quoteId: string,
    newStatus: QuoteStatus
  ) => {
    setIsUpdating(quoteId);
    try {
      const result = await updateQuoteStatus(quoteId, newStatus);
      if (result.message) {
        toast.success(result.message);
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDuplicate = async (quoteId: string) => {
    try {
      const result = await duplicateQuote(quoteId);
      if (result.message) {
        toast.success(result.message);
      }
    } catch (error) {
      toast.error("Erreur lors de la duplication");
    }
  };

  const getAvailableStatusTransitions = (currentStatus: QuoteStatus) => {
    switch (currentStatus) {
      case QuoteStatus.DRAFT:
        return [QuoteStatus.SENT, QuoteStatus.CANCELLED];
      case QuoteStatus.SENT:
        return [
          QuoteStatus.ACCEPTED,
          QuoteStatus.REJECTED,
          QuoteStatus.EXPIRED,
        ];
      case QuoteStatus.ACCEPTED:
        return []; // Aucune transition possible
      case QuoteStatus.REJECTED:
        return [QuoteStatus.DRAFT]; // Possibilité de remettre en brouillon
      case QuoteStatus.EXPIRED:
        return [QuoteStatus.DRAFT, QuoteStatus.CANCELLED];
      case QuoteStatus.CANCELLED:
        return [QuoteStatus.DRAFT];
      default:
        return [];
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
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro, titre, ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
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
                  <TableHead>Titre</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Total TTC</TableHead>
                  <TableHead>Validité</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => {
                  const isExpired = isExpiredQuote(quote);
                  const availableTransitions = getAvailableStatusTransitions(
                    quote.status
                  );

                  return (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <div className="font-medium">{quote.number}</div>
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
                        <div className="max-w-[200px] truncate">
                          {quote.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {quote.items.length} item
                          {quote.items.length > 1 ? "s" : ""}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              statusConfig[quote.status].color
                            }`}
                          />
                          <Badge variant={statusConfig[quote.status].variant}>
                            {statusConfig[quote.status].label}
                          </Badge>
                          {isExpired && (
                            <Badge variant="destructive" className="text-xs">
                              Expiré
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium">
                          {formatPrice(quote.totalTTC)}
                        </div>
                      </TableCell>

                      <TableCell>
                        {quote.validUntil ? (
                          <div className={isExpired ? "text-red-600" : ""}>
                            {formatDate(quote.validUntil)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      <TableCell>{formatDate(quote.createdAt)}</TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Ouvrir le menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>

                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/quotes/${quote.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/quotes/${quote.id}/pdf`}>
                                <Download className="mr-2 h-4 w-4" />
                                PDF
                              </Link>
                            </DropdownMenuItem>

                            {quote.status !== QuoteStatus.ACCEPTED && (
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/quotes/${quote.id}/edit`}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </Link>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              onClick={() => handleDuplicate(quote.id)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Dupliquer
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Changements de statut */}
                            {availableTransitions.map((status) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() =>
                                  handleStatusChange(quote.id, status)
                                }
                                disabled={isUpdating === quote.id}
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                Marquer comme{" "}
                                {statusConfig[status].label.toLowerCase()}
                              </DropdownMenuItem>
                            ))}

                            {availableTransitions.length > 0 && (
                              <DropdownMenuSeparator />
                            )}

                            {quote.status !== QuoteStatus.ACCEPTED && (
                              <DeleteQuoteDialog quote={quote}>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DeleteQuoteDialog>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
