import { getClients } from "@/app/actions/clients";
import { ClientForm } from "@/components/dashboard/client-form";
import { ClientsTable } from "@/components/dashboard/clients-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Users } from "lucide-react";

interface PageProps {
  searchParams: { tab?: string };
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const clients = await getClients();
  const defaultTab = searchParams.tab === "add" ? "add" : "list";

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Tabs defaultValue={defaultTab} className="flex flex-1 flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Liste des clients
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Nouveau client
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="flex-1">
          <ClientsTable clients={clients} />
        </TabsContent>

        <TabsContent value="add" className="flex-1">
          <ClientForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
