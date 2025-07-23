"use client";

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
  Building,
  Copy,
  Edit,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteClientDialog } from "./dialog-delete-client";
import { EditClientDialog } from "./edit-dialog-client";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  isProfessional: boolean;
  subject?: string | null;
  internalNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ClientsTableProps {
  clients: Client[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer les clients en fonction du terme de recherche
  const filteredClients = clients.filter(
    (client) =>
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié dans le presse-papiers`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Clients ({clients.length})</CardTitle>
            <CardDescription>
              Gérez votre portefeuille de clients
            </CardDescription>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email, ou sujet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredClients.length === 0 ? (
          <div className="py-8 text-center">
            <User className="mx-auto size-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Aucun client
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Aucun client ne correspond à votre recherche."
                : "Commencez par ajouter un nouveau client."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium">
                          {client.firstName} {client.lastName}
                        </div>
                        {client.address && (
                          <div className="text-sm text-muted-foreground">
                            {client.address}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 size-3" />
                          {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="mr-1 size-3" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          client.isProfessional ? "default" : "secondary"
                        }
                      >
                        {client.isProfessional ? (
                          <>
                            <Building className="mr-1 size-3" />
                            Professionnel
                          </>
                        ) : (
                          <>
                            <User className="mr-1 size-3" />
                            Particulier
                          </>
                        )}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {client.subject || (
                          <span className="text-muted-foreground">
                            Non spécifié
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{formatDate(client.createdAt)}</TableCell>

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
                              copyToClipboard(client.email, "Email")
                            }
                          >
                            <Copy className="mr-2 size-4" />
                            Copier l'email
                          </DropdownMenuItem>

                          {client.phone && (
                            <DropdownMenuItem
                              onClick={() =>
                                copyToClipboard(client.phone!, "Téléphone")
                              }
                            >
                              <Copy className="mr-2 size-4" />
                              Copier le téléphone
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <EditClientDialog client={client}>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Edit className="mr-2 size-4" />
                              Modifier
                            </DropdownMenuItem>
                          </EditClientDialog>

                          <DeleteClientDialog client={client}>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 size-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DeleteClientDialog>
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
