"use client";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { ClientDialog } from "@/components/dashboard/client-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Briefcase,
  Building,
  Calendar,
  Edit,
  Filter,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  status: string;
  isProfessional: boolean;
  subject?: string;
  lastContactAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientsResponse {
  clients: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const statusColors = {
  prospect:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
  archived: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
};

const statusLabels = {
  prospect: "Prospect",
  active: "Actif",
  inactive: "Inactif",
  archived: "Archivé",
};

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.append("search", search);
      if (statusFilter && statusFilter !== "all")
        params.append("status", statusFilter);

      const response = await fetch(`/api/admin/clients?${params}`);
      if (!response.ok) throw new Error("Erreur lors du chargement");

      const data: ClientsResponse = await response.json();
      setClients(data.clients);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        if (pagination.page !== 1) {
          setPagination((prev) => ({ ...prev, page: 1 })); // Reset à la page 1 lors d'une recherche
        } else {
          fetchClients();
        }
      },
      search ? 300 : 0
    ); // Debounce de 300ms pour la recherche

    return () => clearTimeout(timeoutId);
  }, [search, statusFilter, fetchClients, pagination.page]);

  useEffect(() => {
    fetchClients();
  }, [pagination.page, fetchClients]);

  const handleDelete = async (clientId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return;

    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      fetchClients(); // Recharger la liste
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression du client");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader
        eyebrow="Votre carnet d'adresses"
        title="Cli"
        titleAccent="ents"
        description="Les demandes reçues depuis la landing et les entreprises ajoutées depuis la prospection se retrouvent toutes ici."
        actions={<ClientDialog onSuccess={fetchClients} />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total"
          value={pagination.total}
          sub="Fiches enregistrées"
          icon={Building}
        />
        <StatCard
          label="Prospects"
          value={clients.filter((c) => c.status === "prospect").length}
          sub="Sur cette page"
          icon={Calendar}
        />
        <StatCard
          label="Actifs"
          value={clients.filter((c) => c.status === "active").length}
          sub="Sur cette page"
          icon={UserCheck}
        />
        <StatCard
          label="Professionnels"
          value={clients.filter((c) => c.isProfessional).length}
          sub="Sur cette page"
          icon={Briefcase}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email, entreprise…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <Filter className="mr-2 size-4" />
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="prospect">Prospects</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="inactive">Inactifs</SelectItem>
            <SelectItem value="archived">Archivés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed bg-card p-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-[#7158ff]" />
          Chargement des clients…
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            search || statusFilter !== "all"
              ? "Aucun client ne correspond"
              : "Votre carnet est vide"
          }
          description={
            search || statusFilter !== "all"
              ? "Modifiez votre recherche ou retirez le filtre de statut."
              : "Ajoutez un client à la main, ou passez par la prospection pour en importer depuis la base Sirene."
          }
        />
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <div
              key={client.id}
              className="rounded-2xl border bg-card p-5 transition-colors hover:border-[#7158ff]/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {client.firstName} {client.lastName}
                    </h3>
                    <Badge
                      className={statusColors[client.status as keyof typeof statusColors]}
                    >
                      {statusLabels[client.status as keyof typeof statusLabels]}
                    </Badge>
                    <Badge variant="outline">
                      {client.isProfessional ? "Professionnel" : "Particulier"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-muted-foreground md:grid-cols-2">
                    <p className="flex items-center gap-2">
                      <Mail className="size-3.5 shrink-0" />
                      {client.email || <span className="italic">email à compléter</span>}
                    </p>
                    {client.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="size-3.5 shrink-0" />
                        {client.phone}
                      </p>
                    )}
                    {client.company && (
                      <p className="flex items-center gap-2">
                        <Building className="size-3.5 shrink-0" />
                        {client.company}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Calendar className="size-3.5 shrink-0" />
                      Dernier contact :{" "}
                      {client.lastContactAt
                        ? format(new Date(client.lastContactAt), "dd MMMM yyyy", { locale: fr })
                        : "jamais"}
                    </p>
                  </div>

                  {client.subject && (
                    <p className="mt-3 line-clamp-2 rounded-xl bg-muted/50 p-3 text-sm text-foreground">
                      {client.subject}
                    </p>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="shrink-0">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <ClientDialog
                      client={client}
                      onSuccess={fetchClients}
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Edit className="mr-2 size-4" />
                          Modifier
                        </DropdownMenuItem>
                      }
                    />
                    <DropdownMenuItem asChild disabled={!client.email}>
                      <a href={`mailto:${client.email}`}>
                        <Mail className="mr-2 size-4" />
                        Envoyer un mail
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => handleDelete(client.id)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} sur {pagination.pages} · {pagination.total} client
            {pagination.total > 1 ? "s" : ""} au total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
