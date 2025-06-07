// components/dashboard/quotes/working-pdf-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { toast } from "sonner";

// Import dynamique OBLIGATOIRE pour éviter les erreurs SSR
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span>Chargement PDF...</span> }
);

// Import dynamique de votre composant PDF
const QuotePDF = dynamic(
  () => import("./quote-pdf").then((mod) => mod.QuotePDF),
  { ssr: false }
);

interface Quote {
  id: string;
  quoteNumber: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    isProfessional: boolean;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  validUntil: Date;
  notes?: string | null;
  createdAt: Date;
}

interface WorkingPDFButtonProps {
  quote: Quote;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function WorkingPDFButton({
  quote,
  variant = "outline",
  size = "default",
  className = "",
}: WorkingPDFButtonProps) {
  const [isClient, setIsClient] = useState(false);

  // Assurer le rendu côté client uniquement
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Pendant le chargement côté client
  if (!isClient) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="mr-2 size-4 animate-spin" />
        Préparation...
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<QuotePDF quote={quote} />}
      fileName={`Devis_${quote.quoteNumber}.pdf`}
    >
      {({ blob, url, loading, error }) => {
        if (error) {
          console.error("Erreur PDF:", error);
          toast.error("Erreur lors de la génération du PDF");
          return (
            <Button variant="destructive" size={size} className={className}>
              ❌ Erreur PDF
            </Button>
          );
        }

        return (
          <Button
            variant={variant}
            size={size}
            className={className}
            disabled={loading}
            onClick={() => {
              if (!loading && url) {
                toast.success("PDF généré avec succès !");
              }
            }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download className="mr-2 size-4" />
                Télécharger PDF
              </>
            )}
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
}
