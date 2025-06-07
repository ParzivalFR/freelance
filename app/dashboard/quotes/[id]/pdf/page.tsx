// app/dashboard/quotes/[id]/pdf/page.tsx
import { getQuoteById } from "@/app/actions/quotes";
import { QuotePDFViewer } from "@/components/dashboard/quotes/quote-pdf-viewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface QuotePDFPageProps {
  params: Promise<{ id: string }>; // ← Await Promise
}

export default async function QuotePDFPage({ params }: QuotePDFPageProps) {
  const resolvedParams = await params; // ← Await params
  const quote = await getQuoteById(resolvedParams.id);

  if (!quote) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/quotes/${quote.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">PDF - {quote.number}</h1>
            <p className="text-muted-foreground">{quote.title}</p>
          </div>
        </div>
      </div>

      {/* Viewer PDF */}
      <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
        <QuotePDFViewer quote={quote} />
      </div>
    </div>
  );
}
