// app/dashboard/quotes/page.tsx
import { getClients } from "@/app/actions/clients";
import { getQuotes } from "@/app/actions/quotes";
import { QuoteForm } from "@/components/dashboard/quotes/quote-form";
import { QuotesTable } from "@/components/dashboard/quotes/quote-table";
import { QuotesStats } from "@/components/dashboard/quotes/quotes-stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileText, Plus } from "lucide-react";

// Import dynamique de la table des devis pour éviter les erreurs SSR

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function QuotesPage({ searchParams }: PageProps) {
  const [quotes, clients, resolvedSearchParams] = await Promise.all([
    getQuotes(),
    getClients(),
    searchParams,
  ]);

  const defaultTab =
    resolvedSearchParams.tab === "add"
      ? "add"
      : resolvedSearchParams.tab === "stats"
      ? "stats"
      : "list";

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Tabs defaultValue={defaultTab} className="flex flex-1 flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="size-4" />
            Liste des devis
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="size-4" />
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Plus className="size-4" />
            Nouveau devis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="flex-1">
          <QuotesTable quotes={quotes} />
        </TabsContent>

        <TabsContent value="stats" className="flex-1">
          <QuotesStats quotes={quotes} />
        </TabsContent>

        <TabsContent value="add" className="flex-1">
          <QuoteForm clients={clients} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
