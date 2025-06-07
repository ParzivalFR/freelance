// components/dashboard/quotes/fixed-pdf-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Download, Loader2, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ====== INTERFACES ======
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

interface Quote {
  id: string;
  quoteNumber: string;
  client: Client;
  items: QuoteItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  validUntil: Date;
  notes?: string | null;
  createdAt: Date;
}

interface FixedPDFButtonProps {
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

// ====== COMPOSANT PRINCIPAL ======
export function UpdatedSimplePDFButton({
  quote,
  variant = "outline",
  size = "default",
  className = "",
}: FixedPDFButtonProps) {
  const [isClient, setIsClient] = useState(false);
  const [loadingStyle, setLoadingStyle] = useState<string | null>(null);
  const [ReactPDFComponents, setReactPDFComponents] = useState<any>(null);

  // ====== MONTAGE CLIENT SEULEMENT ======
  useEffect(() => {
    setIsClient(true);

    // Charger React-PDF UNIQUEMENT côté client
    const loadReactPDF = async () => {
      try {
        // Import avec gestion d'erreur
        const reactPDF = await import("@react-pdf/renderer");
        setReactPDFComponents({
          Document: reactPDF.Document,
          Page: reactPDF.Page,
          Text: reactPDF.Text,
          View: reactPDF.View,
          StyleSheet: reactPDF.StyleSheet,
          PDFDownloadLink: reactPDF.PDFDownloadLink,
        });
      } catch (error) {
        console.error("Erreur chargement React-PDF:", error);
        // Continuer sans React-PDF
        setReactPDFComponents(false);
      }
    };

    // Délai pour éviter les erreurs d'hydratation
    const timer = setTimeout(loadReactPDF, 100);
    return () => clearTimeout(timer);
  }, []);

  // ====== FONCTIONS UTILITAIRES ======
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

  // ====== GÉNÉRATION HTML (FALLBACK) ======
  const generateStyledHTML = (style: string) => {
    const baseStyles = `
      @page { margin: 20mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #2d3748; font-size: 12px; }
      .container { max-width: 800px; margin: 0 auto; }
    `;

    const styleVariants = {
      professional: `
        ${baseStyles}
        .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; }
        .company h1 { font-size: 28px; font-weight: 700; color: #7c3aed; }
        .quote-info { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; }
        .table { border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .table thead { background: #1f2937; }
        .table th { color: white; padding: 12px; font-weight: 600; }
        .totals-card { background: linear-gradient(135deg, white 0%, #f8fafc 100%); border-radius: 8px; }
      `,
      minimal: `
        ${baseStyles}
        body { background: #f9fafb; }
        .header { border-bottom: 1px solid #e5e7eb; padding: 40px 0; }
        .company h1 { font-size: 36px; font-weight: 100; color: #000; letter-spacing: -1px; }
        .quote-title { font-size: 48px; font-weight: 100; color: #7c3aed; letter-spacing: 4px; }
        .table { border: 1px solid #e5e7eb; border-radius: 4px; }
        .table thead { background: #111827; }
      `,
      classic: `
        ${baseStyles}
        .document { border: 2px solid #2d3748; padding: 30px; }
        .header { border-bottom: 3px double #2d3748; padding-bottom: 20px; }
        .company h1 { text-decoration: underline; color: #2d3748; }
        .table { border: 2px solid #2d3748; }
        .table th, .table td { border: 1px solid #2d3748; }
        .section-title { text-decoration: underline; }
      `,
    };

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devis ${quote.quoteNumber} - ${style}</title>
    <style>
        ${
          styleVariants[style as keyof typeof styleVariants] ||
          styleVariants.professional
        }
        
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
        .company-info { font-size: 11px; line-height: 1.5; }
        .quote-info h2 { font-size: 24px; margin-bottom: 8px; }
        .client { background: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { padding: 10px; text-align: left; }
        .table th:nth-child(2), .table th:nth-child(3), .table th:nth-child(4), 
        .table td:nth-child(2), .table td:nth-child(3), .table td:nth-child(4) { text-align: right; }
        .table tbody tr:nth-child(even) { background: #f7fafc; }
        .totals { display: flex; justify-content: flex-end; margin: 20px 0; }
        .totals-card { padding: 20px; min-width: 300px; border: 1px solid #e2e8f0; }
        .total-line { display: flex; justify-content: space-between; padding: 5px 0; }
        .total-final { border-top: 2px solid #7158ff; margin-top: 10px; padding-top: 10px; font-weight: bold; }
        .notes { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; }
        @media print { body { background: white !important; } }
    </style>
</head>
<body>
    <div class="container ${style === "classic" ? "document" : ""}">
        <div class="header">
            <div class="company">
                <h1>Gaël Richard</h1>
                <div class="company-info">
                    <div>Développeur Freelance</div>
                    <div>7 rue du pré de la ramée</div>
                    <div>44550 Montoir De Bretagne</div>
                    <div>SIRET: 93044860000013</div>
                    <div>Email: gael_pro@ik.me</div>
                    <div>Tél: +33 6 33 36 40 94</div>
                </div>
            </div>
            <div class="quote-info">
                <h2 class="quote-title">DEVIS</h2>
                <p><strong>N° ${quote.quoteNumber}</strong></p>
                <p>Date: ${formatDate(quote.createdAt)}</p>
                <p>Valide jusqu'au: ${formatDate(quote.validUntil)}</p>
            </div>
        </div>

        <div class="client">
            <h3>Facturé à :</h3>
            <div><strong>${quote.client.firstName} ${
      quote.client.lastName
    }</strong></div>
            <div>${quote.client.email}</div>
            ${quote.client.phone ? `<div>${quote.client.phone}</div>` : ""}
            ${quote.client.address ? `<div>${quote.client.address}</div>` : ""}
            <div><em>Type: ${
              quote.client.isProfessional ? "Professionnel" : "Particulier"
            }</em></div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Qté</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${quote.items
                  .map(
                    (item) => `
                    <tr>
                        <td><strong>${item.description}</strong></td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.unitPrice)}</td>
                        <td><strong>${formatCurrency(
                          item.totalPrice
                        )}</strong></td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-card">
                <div class="total-line">
                    <span>Sous-total HT :</span>
                    <span>${formatCurrency(quote.subtotal)}</span>
                </div>
                <div class="total-line">
                    <span>TVA (${quote.vatRate}%) :</span>
                    <span>${formatCurrency(quote.vatAmount)}</span>
                </div>
                <div class="total-line total-final">
                    <span>TOTAL TTC :</span>
                    <span>${formatCurrency(quote.totalAmount)}</span>
                </div>
            </div>
        </div>

        ${
          quote.notes
            ? `
            <div class="notes">
                <h3>Notes importantes :</h3>
                <p>${quote.notes}</p>
            </div>
        `
            : ""
        }

        <div class="footer">
            <div style="font-weight: bold; color: #7158ff; margin-bottom: 10px;">
                Merci pour votre confiance !
            </div>
            <div style="font-size: 10px; color: #6b7280;">
                Ce devis est valable 30 jours à compter de sa date d'émission.
            </div>
        </div>
    </div>

    <script>
        window.onload = function() {
            setTimeout(() => window.print(), 500);
        };
    </script>
</body>
</html>`;
  };

  // ====== COMPOSANT PDF SIMPLE ======
  const createSimplePDFDocument = () => {
    if (!ReactPDFComponents) return null;

    const { Document, Page, Text, View, StyleSheet } = ReactPDFComponents;

    const styles = StyleSheet.create({
      page: {
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        padding: 30,
      },
      header: {
        fontSize: 20,
        marginBottom: 20,
        textAlign: "center",
        color: "#7158ff",
      },
      section: { margin: 10, padding: 10, flexGrow: 1 },
      text: { fontSize: 12, marginBottom: 5 },
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.header}>DEVIS {quote.quoteNumber}</Text>
            <Text style={styles.text}>
              Client: {quote.client.firstName} {quote.client.lastName}
            </Text>
            <Text style={styles.text}>Email: {quote.client.email}</Text>
            <Text style={styles.text}>
              Total: {formatCurrency(quote.totalAmount)}
            </Text>
          </View>
        </Page>
      </Document>
    );
  };

  // ====== GESTION DES TÉLÉCHARGEMENTS ======
  const handleDownload = async (style: string) => {
    setLoadingStyle(style);

    try {
      // Si React-PDF est disponible et on veut du PDF
      if (ReactPDFComponents && style === "pdf-simple") {
        // Le PDFDownloadLink gérera le téléchargement
        toast.success("PDF en préparation...");
        return;
      }

      // Sinon, génération HTML
      const htmlContent = generateStyledHTML(style);
      const printWindow = window.open("", "_blank");

      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        toast.success(`Style ${style} ouvert pour impression`);
      } else {
        // Fallback: téléchargement HTML
        const blob = new Blob([htmlContent], {
          type: "text/html;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Devis_${quote.quoteNumber}_${style}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Devis ${style} téléchargé`);
      }
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      toast.error("Erreur lors de la génération");
    } finally {
      setLoadingStyle(null);
    }
  };

  // ====== STYLES DISPONIBLES ======
  const styles = [
    {
      key: "professional",
      name: "Professionnel",
      icon: "🎨",
      description: "Design moderne",
    },
    {
      key: "minimal",
      name: "Minimaliste",
      icon: "✨",
      description: "Style épuré",
    },
    {
      key: "classic",
      name: "Classique",
      icon: "📄",
      description: "Look traditionnel",
    },
  ];

  // Si React-PDF est chargé, ajouter l'option PDF
  if (ReactPDFComponents) {
    styles.push({
      key: "pdf-simple",
      name: "PDF Simple",
      icon: "📋",
      description: "PDF via React-PDF",
    });
  }

  // ====== RENDU PENDANT LE CHARGEMENT ======
  if (!isClient) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="mr-2 size-4 animate-spin" />
        Initialisation...
      </Button>
    );
  }

  // ====== RENDU PRINCIPAL ======
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Download className="mr-2 size-4" />
          Télécharger
          <ChevronDown className="ml-2 size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="size-4" />
          Choisir un style
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {styles.map(({ key, name, icon, description }) => {
          // Si c'est le PDF simple et React-PDF est disponible
          if (key === "pdf-simple" && ReactPDFComponents) {
            const { PDFDownloadLink } = ReactPDFComponents;
            const document = createSimplePDFDocument();

            if (!document) {
              return (
                <DropdownMenuItem key={key} disabled>
                  <span className="mr-2 text-lg">❌</span>
                  <div>
                    <div className="font-medium">PDF indisponible</div>
                    <div className="text-xs text-muted-foreground">
                      Erreur de génération
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            }

            return (
              <DropdownMenuItem key={key} asChild>
                <div className="p-0">
                  <PDFDownloadLink
                    document={document}
                    fileName={`Devis_${quote.quoteNumber}.pdf`}
                    className="flex w-full items-center gap-2 px-3 py-2 hover:bg-accent"
                  >
                    {({ loading, error }) => (
                      <div className="flex w-full items-center gap-2">
                        {error ? (
                          <span className="text-lg">❌</span>
                        ) : loading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <span className="text-lg">{icon}</span>
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{name}</div>
                          <div className="text-xs text-muted-foreground">
                            {error
                              ? "Erreur PDF"
                              : loading
                              ? "Génération..."
                              : description}
                          </div>
                        </div>
                      </div>
                    )}
                  </PDFDownloadLink>
                </div>
              </DropdownMenuItem>
            );
          }

          // Pour les autres styles (HTML)
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => handleDownload(key)}
              className="flex items-center gap-2 p-3"
            >
              {loadingStyle === key ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <span className="text-lg">{icon}</span>
              )}
              <div className="flex-1">
                <div className="font-medium">{name}</div>
                <div className="text-xs text-muted-foreground">
                  {loadingStyle === key ? "Génération..." : description}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}

        {!ReactPDFComponents && ReactPDFComponents !== false && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-center">
              <div className="w-full">
                <Loader2 className="mx-auto mb-1 size-4 animate-spin" />
                <div className="text-xs">Chargement React-PDF...</div>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
