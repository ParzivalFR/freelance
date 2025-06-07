// components/dashboard/quote-pdf-viewer.tsx
"use client";

import { QuoteDocument } from "@/components/pdf/QuoteDocument";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PDFViewer } from "@react-pdf/renderer";
import { Download, Eye, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface QuoteData {
  id: string;
  number: string;
  title: string;
  description?: string | null;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CANCELLED";
  subtotalHT: number;
  taxRate: number;
  taxAmount: number;
  totalTTC: number;
  validUntil: Date | null;
  createdAt: Date;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  notes?: string | null;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    isProfessional: boolean;
  };
  items: Array<{
    title: string;
    description?: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit: string;
  }>;
}

interface QuotePDFViewerProps {
  quote: QuoteData;
}

export function QuotePDFViewer({ quote }: QuotePDFViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"viewer" | "download">("viewer");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDirectDownload = async () => {
    try {
      const response = await fetch(`/api/quotes/${quote.id}/pdf`);

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${quote.number}_${quote.client.lastName}.pdf`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF téléchargé avec succès !");
    } catch (error) {
      console.error("Erreur téléchargement PDF:", error);
      toast.error("Erreur lors du téléchargement du PDF");
    }
  };

  if (!mounted) {
    return (
      <div className="flex flex-col h-full p-4 gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex-1">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "viewer" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("viewer")}
          >
            <Eye className="mr-2 h-4 w-4" />
            Aperçu
          </Button>
          <Button
            variant={viewMode === "download" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("download")}
          >
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleDirectDownload}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Télécharger PDF
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-4">
        {viewMode === "viewer" ? (
          <div className="h-full border rounded-lg overflow-hidden bg-white">
            <PDFViewer
              width="100%"
              height="100%"
              showToolbar={true}
              style={{
                border: "none",
              }}
            >
              <QuoteDocument quote={quote} />
            </PDFViewer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="max-w-md space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Télécharger le devis
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cliquez sur le bouton ci-dessous pour télécharger le PDF du
                  devis <span className="font-medium">{quote.number}</span>
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleDirectDownload}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Download className="mr-2 h-5 w-5" />
                Télécharger {quote.number}.pdf
              </Button>

              <div className="text-xs text-muted-foreground">
                <p>
                  Nom du fichier : {quote.number}_{quote.client.lastName}.pdf
                </p>
                <p>Taille estimée : ~150 KB</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
