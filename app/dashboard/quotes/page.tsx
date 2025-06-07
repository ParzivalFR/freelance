// app/dashboard/quotes/page.tsx
import { getClients } from "@/app/actions/clients";
import { getQuotes } from "@/app/actions/quotes";
import { QuoteForm } from "@/components/dashboard/quotes/quote-form";
import { QuotesTable } from "@/components/dashboard/quotes/quotes-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ tab?: string }>; // ← Await Promise
}

export default async function QuotesPage({ searchParams }: PageProps) {
  const [quotes, clients, resolvedSearchParams] = await Promise.all([
    getQuotes(),
    getClients(),
    searchParams, // ← Await searchParams
  ]);

  const defaultTab = resolvedSearchParams.tab === "add" ? "add" : "list";

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Tabs defaultValue={defaultTab} className="flex flex-1 flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Liste des devis
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau devis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="flex-1">
          <QuotesTable quotes={quotes} />
        </TabsContent>

        <TabsContent value="add" className="flex-1">
          <QuoteForm clients={clients} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
