// components/pdf/simple-pdf-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Client {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  isProfessional: boolean;
}

interface QuoteData {
  quoteNumber: string;
  client: Client;
  items: QuoteItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  validUntil: Date;
  notes?: string | null;
  createdAt: Date;
}

interface SimplePDFButtonProps {
  quote: QuoteData;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function SimplePDFButton({
  quote,
  variant = "outline",
  className,
  size = "default",
}: SimplePDFButtonProps) {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [PDFDownloadLink, setPDFDownloadLink] = useState<any>(null);
  const [QuotePDF, setQuotePDF] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);

    // Import dynamique côté client uniquement
    const loadPDFComponents = async () => {
      try {
        const [pdfRenderer, quotePDF] = await Promise.all([
          import("@react-pdf/renderer"),
          import("@/components/dashboard/quotes/quote-pdf"),
        ]);

        setPDFDownloadLink(() => pdfRenderer.PDFDownloadLink);
        setQuotePDF(() => quotePDF.QuotePDF);
      } catch (error) {
        console.error("Erreur lors du chargement des composants PDF:", error);
      }
    };

    loadPDFComponents();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const handleFallbackDownload = () => {
    setIsLoading(true);

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Devis ${quote.quoteNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #7158ff; padding-bottom: 20px; margin-bottom: 30px; }
              .company-name { color: #7158ff; font-size: 24px; font-weight: bold; }
              .quote-title { color: #7158ff; font-size: 28px; font-weight: bold; text-align: right; }
              .client-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background: #7158ff; color: white; }
              .totals { text-align: right; margin: 20px 0; }
              .total-line { font-weight: bold; font-size: 18px; color: #7158ff; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="company-name">Gaël Richard</div>
                <p>Développeur Freelance</p>
                <p>7 rue du pré de la ramée</p>
                <p>44550 Montoir De Bretagne</p>
                <p>SIRET: 93044860000013</p>
                <p>Email: gael_pro@ik.me</p>
                <p>Tél: +33 6 33 36 40 94</p>
              </div>
              <div>
                <div class="quote-title">DEVIS</div>
                <p><strong>N° ${quote.quoteNumber}</strong></p>
                <p>Date: ${formatDate(quote.createdAt)}</p>
                <p>Valide jusqu'au: ${formatDate(quote.validUntil)}</p>
              </div>
            </div>
            
            <div class="client-info">
              <h3>Facturé à:</h3>
              <p><strong>${quote.client.firstName} ${
        quote.client.lastName
      }</strong></p>
              <p>${quote.client.email}</p>
              ${quote.client.phone ? `<p>${quote.client.phone}</p>` : ""}
              ${quote.client.address ? `<p>${quote.client.address}</p>` : ""}
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${quote.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.description}</td>
                    <td style="text-align: center">${item.quantity}</td>
                    <td style="text-align: right">${formatCurrency(
                      item.unitPrice
                    )}</td>
                    <td style="text-align: right">${formatCurrency(
                      item.totalPrice
                    )}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            
            <div class="totals">
              <p>Sous-total HT: <strong>${formatCurrency(
                quote.subtotal
              )}</strong></p>
              <p>TVA (${quote.vatRate}%): <strong>${formatCurrency(
        quote.vatAmount
      )}</strong></p>
              <p class="total-line">Total TTC: <strong>${formatCurrency(
                quote.totalAmount
              )}</strong></p>
            </div>
            
            ${
              quote.notes
                ? `
              <div style="margin: 30px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h3>Notes:</h3>
                <p>${quote.notes}</p>
              </div>
            `
                : ""
            }
            
            <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
              <p><strong>Merci pour votre confiance !</strong></p>
              <p>Ce devis est valable 30 jours à compter de sa date d'émission.</p>
            </div>
          </body>
        </html>
      `;

      // Ouvrir dans une nouvelle fenêtre pour impression
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        // Fallback: télécharger en HTML
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Devis_${quote.quoteNumber}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Si pas encore côté client, afficher un bouton simple
  if (!isClient) {
    return (
      <Button variant={variant} className={className} size={size} disabled>
        <Download className="mr-2 size-4" />
        Chargement...
      </Button>
    );
  }

  // Si les composants PDF ne sont pas chargés, utiliser le fallback
  if (!PDFDownloadLink || !QuotePDF) {
    return (
      <Button
        variant={variant}
        className={className}
        size={size}
        onClick={handleFallbackDownload}
        disabled={isLoading}
      >
        <Download className="mr-2 size-4" />
        {isLoading ? "Génération..." : "Télécharger PDF"}
      </Button>
    );
  }

  // Rendu avec React-PDF
  try {
    return (
      <PDFDownloadLink
        document={<QuotePDF quote={quote} />}
        fileName={`Devis_${quote.quoteNumber}.pdf`}
      >
        {({ loading }: { loading: boolean }) => (
          <Button
            variant={variant}
            className={className}
            size={size}
            disabled={loading}
          >
            <Download className="mr-2 size-4" />
            {loading ? "Génération..." : "Télécharger PDF"}
          </Button>
        )}
      </PDFDownloadLink>
    );
  } catch (error) {
    console.error("Erreur avec React-PDF, utilisation du fallback:", error);
    return (
      <Button
        variant={variant}
        className={className}
        size={size}
        onClick={handleFallbackDownload}
        disabled={isLoading}
      >
        <Download className="mr-2 size-4" />
        {isLoading ? "Génération..." : "Télécharger PDF"}
      </Button>
    );
  }
}
