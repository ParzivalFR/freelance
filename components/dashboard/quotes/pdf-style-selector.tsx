// components/dashboard/quotes/pdf-style-selector.tsx
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
import type { Quote } from "@/types/QuoteTypes";
import { ChevronDown, Download, Loader2, Palette } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

// Types de styles disponibles
type PDFStyle = "professional" | "minimal" | "classic" | "html";

interface PDFStyleConfig {
  name: string;
  description: string;
  icon: React.ReactNode;
  component?: string;
}

const PDF_STYLES: Record<PDFStyle, PDFStyleConfig> = {
  professional: {
    name: "Professionnel",
    description: "Design moderne avec en-tête coloré",
    icon: "🎨",
    component: "ProfessionalQuotePDF",
  },
  minimal: {
    name: "Minimaliste",
    description: "Style épuré et élégant",
    icon: "✨",
    component: "ModernMinimalPDF",
  },
  classic: {
    name: "Classique",
    description: "Template simple et efficace",
    icon: "📄",
    component: "ImprovedQuotePDF",
  },
  html: {
    name: "HTML Imprimable",
    description: "Version HTML pour impression",
    icon: "🖨️",
  },
};

interface PDFStyleSelectorProps {
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

export function PDFStyleSelector({
  quote,
  variant = "outline",
  size = "default",
  className = "",
}: PDFStyleSelectorProps) {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStyle, setLoadingStyle] = useState<PDFStyle | null>(null);
  const [pdfComponents, setPdfComponents] = useState<any>({});

  useEffect(() => {
    setIsClient(true);

    // Charger tous les composants PDF
    const loadAllPDFComponents = async () => {
      try {
        const [renderer, professional, minimal, classic] = await Promise.all([
          import("@react-pdf/renderer"),
          import("./professional-quote-pdf"),
          import("./modern-minimal-pdf"),
          import("./quote-pdf"),
        ]);

        setPdfComponents({
          PDFDownloadLink: renderer.PDFDownloadLink,
          ProfessionalQuotePDF: professional.ProfessionalQuotePDF,
          ModernMinimalPDF: minimal.ModernMinimalPDF,
          ImprovedQuotePDF: classic.QuotePDF,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des composants PDF:", error);
      }
    };

    loadAllPDFComponents();
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

  // Génération HTML améliorée
  const generateHTMLContent = () => {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devis ${quote.quoteNumber} - Gaël Richard</title>
    <style>
        @page { margin: 15mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            line-height: 1.6; color: #1f2937; font-size: 11px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; padding: 20px;
        }
        .document {
            max-width: 800px; margin: 0 auto; background: white;
            border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white; padding: 30px; position: relative;
        }
        .header::after {
            content: ''; position: absolute; bottom: 0; left: 0; right: 0;
            height: 4px; background: linear-gradient(90deg, #7c3aed, #06b6d4);
        }
        .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
        .company h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
        .company .tagline { color: #7c3aed; font-size: 14px; margin-bottom: 16px; }
        .company-info { font-size: 11px; opacity: 0.9; line-height: 1.5; }
        .quote-box {
            background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
            padding: 20px; border-radius: 8px; text-align: right; min-width: 200px;
        }
        .quote-title { font-size: 24px; font-weight: 300; letter-spacing: 2px; margin-bottom: 8px; }
        .quote-number { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
        .quote-dates { font-size: 10px; opacity: 0.8; }
        .content { padding: 30px; }
        .info-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 30px;
            margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px;
        }
        .info-section h3 {
            font-size: 12px; color: #6b7280; text-transform: uppercase;
            letter-spacing: 0.5px; margin-bottom: 8px; font-weight: 600;
        }
        .client-name { font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
        .client-info { font-size: 11px; color: #4b5563; line-height: 1.5; }
        .client-type {
            display: inline-block; background: #7c3aed; color: white;
            padding: 4px 12px; border-radius: 12px; font-size: 9px;
            font-weight: 600; margin-top: 8px;
        }
        .section-title {
            font-size: 18px; font-weight: 600; color: #1f2937;
            margin: 30px 0 16px 0; position: relative; padding-bottom: 8px;
        }
        .section-title::after {
            content: ''; position: absolute; bottom: 0; left: 0;
            width: 60px; height: 2px; background: #7c3aed;
        }
        .table {
            width: 100%; border-collapse: collapse; margin: 20px 0;
            border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .table thead { background: #1f2937; }
        .table th {
            padding: 12px 16px; text-align: left; font-weight: 600;
            font-size: 10px; color: white; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .table th:nth-child(2), .table th:nth-child(3), .table th:nth-child(4) { text-align: right; }
        .table td {
            padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-size: 11px;
        }
        .table td:nth-child(2), .table td:nth-child(3), .table td:nth-child(4) { text-align: right; }
        .table tbody tr:nth-child(even) { background: #f9fafb; }
        .table tbody tr:hover { background: #f3f4f6; }
        .item-name { font-weight: 600; color: #1f2937; }
        .quantity-badge {
            background: #ede9fe; color: #7c3aed; padding: 4px 8px;
            border-radius: 4px; font-weight: 600; font-size: 10px;
        }
        .totals {
            display: flex; justify-content: flex-end; margin: 30px 0;
        }
        .totals-card {
            background: white; border: 1px solid #e5e7eb; border-radius: 8px;
            padding: 24px; min-width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .total-line {
            display: flex; justify-content: space-between; padding: 8px 0;
            font-size: 12px; color: #6b7280;
        }
        .total-line.subtotal { border-bottom: 1px solid #f3f4f6; margin-bottom: 12px; }
        .total-final {
            background: #1f2937; margin: -24px -24px -24px -24px;
            padding: 20px 24px; border-radius: 0 0 8px 8px;
        }
        .total-final .total-line { color: white; font-size: 14px; font-weight: 600; }
        .total-final .amount { color: #7c3aed; font-size: 18px; font-weight: 700; }
        .notes {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px;
            margin: 30px 0;
        }
        .notes h3 { color: #92400e; font-weight: 600; margin-bottom: 8px; }
        .notes p { color: #92400e; line-height: 1.6; }
        .footer {
            background: #f8fafc; padding: 30px; text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer-highlight {
            font-size: 16px; color: #7c3aed; font-weight: 600;
            margin-bottom: 16px;
        }
        .footer-grid {
            display: grid; grid-template-columns: repeat(3, 1fr);
            gap: 20px; margin-bottom: 20px; text-align: left;
        }
        .footer-section h4 {
            font-size: 10px; color: #1f2937; font-weight: 600;
            text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;
        }
        .footer-section p {
            font-size: 9px; color: #6b7280; line-height: 1.5; margin-bottom: 4px;
        }
        @media print {
            body { background: white !important; padding: 0 !important; }
            .document { box-shadow: none !important; border-radius: 0 !important; }
        }
    </style>
</head>
<body>
    <div class="document">
        <div class="header">
            <div class="header-content">
                <div class="company">
                    <h1>Gaël Richard</h1>
                    <div class="tagline">Développeur Web Freelance</div>
                    <div class="company-info">
                        <div>7 rue du pré de la ramée</div>
                        <div>44550 Montoir De Bretagne</div>
                        <div>SIRET: 93044860000013</div>
                        <div>📧 gael_pro@ik.me • 📱 +33 6 33 36 40 94</div>
                    </div>
                </div>
                <div class="quote-box">
                    <div class="quote-title">DEVIS</div>
                    <div class="quote-number">${quote.quoteNumber}</div>
                    <div class="quote-dates">
                        <div>Émis le ${formatDate(quote.createdAt)}</div>
                        <div>Valide jusqu'au ${formatDate(
                          quote.validUntil
                        )}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="content">
            <div class="info-grid">
                <div class="info-section">
                    <h3>Informations du devis</h3>
                    <div style="font-size: 12px; line-height: 1.6;">
                        <div><strong>Numéro:</strong> ${quote.quoteNumber}</div>
                        <div><strong>Date:</strong> ${formatDate(
                          quote.createdAt
                        )}</div>
                        <div><strong>Validité:</strong> 30 jours</div>
                        <div><strong>Prestations:</strong> ${
                          quote.items.length
                        } item(s)</div>
                    </div>
                </div>
                <div class="info-section">
                    <h3>Facturation</h3>
                    <div class="client-name">${quote.client.firstName} ${
      quote.client.lastName
    }</div>
                    <div class="client-info">
                        <div>📧 ${quote.client.email}</div>
                        ${
                          quote.client.phone
                            ? `<div>📱 ${quote.client.phone}</div>`
                            : ""
                        }
                        ${
                          quote.client.address
                            ? `<div>📍 ${quote.client.address}</div>`
                            : ""
                        }
                    </div>
                    <span class="client-type">
                        ${
                          quote.client.isProfessional
                            ? "💼 Professionnel"
                            : "👤 Particulier"
                        }
                    </span>
                </div>
            </div>
            
            <h2 class="section-title">Prestations détaillées</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Qté</th>
                        <th>Prix unitaire</th>
                        <th>Total HT</th>
                    </tr>
                </thead>
                <tbody>
                    ${quote.items
                      .map(
                        (item) => `
                        <tr>
                            <td>
                                <span class="item-name">${
                                  item.description
                                }</span>
                            </td>
                            <td>
                                <span class="quantity-badge">${
                                  item.quantity
                                }</span>
                            </td>
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
                    <div class="total-line subtotal">
                        <span>Sous-total HT</span>
                        <span>${formatCurrency(quote.subtotal)}</span>
                    </div>
                    <div class="total-line">
                        <span>TVA (${quote.vatRate}%)</span>
                        <span>${formatCurrency(quote.vatAmount)}</span>
                    </div>
                    <div class="total-final">
                        <div class="total-line">
                            <span>TOTAL TTC</span>
                            <span class="amount">${formatCurrency(
                              quote.totalAmount
                            )}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            ${
              quote.notes
                ? `
                <div class="notes">
                    <h3>📝 Notes importantes</h3>
                    <p>${quote.notes}</p>
                </div>
            `
                : ""
            }
        </div>
        
        <div class="footer">
            <div class="footer-highlight">✨ Merci pour votre confiance ! ✨</div>
            
            <div class="footer-grid">
                <div class="footer-section">
                    <h4>Conditions de paiement</h4>
                    <p>30% d'acompte à la commande</p>
                    <p>70% du solde à la livraison</p>
                    <p>Paiement par virement ou chèque</p>
                </div>
                <div class="footer-section">
                    <h4>Informations légales</h4>
                    <p>Devis valable 30 jours</p>
                    <p>Délai de rétractation : 14 jours</p>
                    <p>Auto-entrepreneur dispensé d'immatriculation</p>
                </div>
                <div class="footer-section">
                    <h4>Contact</h4>
                    <p>Une question sur ce devis ?</p>
                    <p>N'hésitez pas à me contacter</p>
                    <p>Réponse garantie sous 24h</p>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        window.onload = () => {
            setTimeout(() => window.print(), 500);
        };
    </script>
</body>
</html>`;
  };

  const handleHTMLDownload = async () => {
    setIsLoading(true);
    setLoadingStyle("html");

    try {
      const htmlContent = generateHTMLContent();

      // Essayer d'ouvrir dans une nouvelle fenêtre pour impression
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        toast.success("Document ouvert pour impression");
      } else {
        // Fallback: télécharger le fichier
        const blob = new Blob([htmlContent], {
          type: "text/html;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Devis_${quote.quoteNumber}_Premium.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Devis téléchargé (HTML Premium)");
      }
    } catch (error) {
      console.error("Erreur HTML:", error);
      toast.error("Erreur lors de la génération");
    } finally {
      setIsLoading(false);
      setLoadingStyle(null);
    }
  };

  const handlePDFDownload = (style: PDFStyle) => {
    if (style === "html") {
      handleHTMLDownload();
      return;
    }

    const config = PDF_STYLES[style];
    const component = pdfComponents[config.component!];

    if (!component || !pdfComponents.PDFDownloadLink) {
      toast.error("Composant PDF non disponible");
      return;
    }

    // Créer un élément temporaire pour le téléchargement
    setLoadingStyle(style);
    setIsLoading(true);

    const { PDFDownloadLink } = pdfComponents;
    const PDFComponent = component;

    // Créer un élément temporaire dans le DOM
    const tempDiv = document.createElement("div");
    tempDiv.style.display = "none";
    document.body.appendChild(tempDiv);

    // Utiliser React pour rendre le PDFDownloadLink
    import("react-dom/client")
      .then(({ createRoot }) => {
        const root = createRoot(tempDiv);

        const TempComponent = () => (
          <PDFDownloadLink
            document={<PDFComponent quote={quote} />}
            fileName={`Devis_${quote.quoteNumber}_${config.name}.pdf`}
          >
            {({ loading, url }: { loading: boolean; url?: string }) => {
              if (!loading && url) {
                // Déclencher le téléchargement
                const link = document.createElement("a");
                link.href = url;
                link.download = `Devis_${quote.quoteNumber}_${config.name}.pdf`;
                link.click();

                // Nettoyer
                setTimeout(() => {
                  root.unmount();
                  document.body.removeChild(tempDiv);
                  setIsLoading(false);
                  setLoadingStyle(null);
                  toast.success(`PDF ${config.name} généré avec succès`);
                }, 1000);
              }
              return null;
            }}
          </PDFDownloadLink>
        );

        root.render(<TempComponent />);
      })
      .catch(() => {
        toast.error("Erreur lors de la génération PDF");
        setIsLoading(false);
        setLoadingStyle(null);
        document.body.removeChild(tempDiv);
      });
  };

  if (!isClient) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="mr-2 size-4 animate-spin" />
        Chargement...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Download className="mr-2 size-4" />
          )}
          {isLoading ? "Génération..." : "Télécharger"}
          <ChevronDown className="ml-2 size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="size-4" />
          Choisir un style
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {Object.entries(PDF_STYLES).map(([key, config]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => handlePDFDownload(key as PDFStyle)}
            disabled={isLoading}
            className="flex flex-col items-start gap-1 p-3"
          >
            <div className="flex items-center gap-2 w-full">
              <span className="text-lg">{config.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{config.name}</div>
                <div className="text-xs text-muted-foreground">
                  {config.description}
                </div>
              </div>
              {loadingStyle === key && (
                <Loader2 className="size-4 animate-spin" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
