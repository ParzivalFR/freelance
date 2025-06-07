// lib/pdf-generator.ts
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

interface QuoteItem {
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
  quoteNumber: string;
  client: Client;
  items: QuoteItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  status: string;
  validUntil: Date;
  notes?: string | null;
  createdAt: Date;
}

export function generateQuotePDF(quote: Quote) {
  const doc = new jsPDF();

  // Couleurs
  const primaryColor = [113, 88, 255]; // #7158ff
  const textColor = [51, 51, 51];
  const lightGray = [240, 240, 240];

  // Configuration de base
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  // En-tête de l'entreprise
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("Gaël Richard", 20, 30);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Développeur Freelance", 20, 40);
  doc.text("7 rue du pré de la ramée", 20, 50);
  doc.text("44550 Montoir De Bretagne", 20, 60);
  doc.text("SIRET: 93044860000013", 20, 70);
  doc.text("Email: gael_pro@ik.me", 20, 80);
  doc.text("Tél: +33 6 33 36 40 94", 20, 90);

  // Titre DEVIS
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("DEVIS", 150, 30);

  // Numéro et date
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`N° ${quote.quoteNumber}`, 150, 45);
  doc.text(
    `Date: ${new Date(quote.createdAt).toLocaleDateString("fr-FR")}`,
    150,
    55
  );
  doc.text(
    `Valide jusqu'au: ${new Date(quote.validUntil).toLocaleDateString(
      "fr-FR"
    )}`,
    150,
    65
  );

  // Informations client
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Facturé à:", 20, 110);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`${quote.client.firstName} ${quote.client.lastName}`, 20, 125);
  doc.text(quote.client.email, 20, 135);
  if (quote.client.phone) {
    doc.text(quote.client.phone, 20, 145);
  }
  if (quote.client.address) {
    doc.text(quote.client.address, 20, 155);
  }

  // Tableau des prestations
  const tableData = quote.items.map((item) => [
    item.description,
    item.quantity.toString(),
    `${item.unitPrice.toFixed(2)} €`,
    `${item.totalPrice.toFixed(2)} €`,
  ]);

  autoTable(doc, {
    startY: 170,
    head: [["Description", "Quantité", "Prix unitaire", "Total"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [textColor[0], textColor[1], textColor[2]],
    },
    alternateRowStyles: {
      fillColor: [lightGray[0], lightGray[1], lightGray[2]],
    },
    margin: { left: 20, right: 20 },
    tableWidth: "auto",
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
    },
  });

  // Position après le tableau
  const finalY = (doc as any).lastAutoTable.finalY + 20;

  // Totaux
  const totalsX = 140;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  doc.text("Sous-total HT:", totalsX, finalY);
  doc.text(`${quote.subtotal.toFixed(2)} €`, 185, finalY);

  doc.text(`TVA (${quote.vatRate}%):`, totalsX, finalY + 10);
  doc.text(`${quote.vatAmount.toFixed(2)} €`, 185, finalY + 10);

  // Ligne de séparation
  doc.setLineWidth(0.5);
  doc.line(totalsX, finalY + 15, 190, finalY + 15);

  // Total TTC
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Total TTC:", totalsX, finalY + 25);
  doc.text(`${quote.totalAmount.toFixed(2)} €`, 185, finalY + 25);

  // Notes
  if (quote.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Notes:", 20, finalY + 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const splitNotes = doc.splitTextToSize(quote.notes, 170);
    doc.text(splitNotes, 20, finalY + 60);
  }

  // Pied de page
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(128, 128, 128);
  doc.text("Merci pour votre confiance !", 20, pageHeight - 20);
  doc.text(
    "Ce devis est valable 30 jours à compter de sa date d'émission.",
    20,
    pageHeight - 10
  );

  // Télécharger le PDF
  doc.save(`Devis_${quote.quoteNumber}.pdf`);
}

// Version simple sans jsPDF (fallback)
export function generateSimpleQuotePDF(quote: Quote) {
  const content = `
DEVIS N° ${quote.quoteNumber}

GAËL RICHARD - Développeur Freelance
7 rue du pré de la ramée
44550 Montoir De Bretagne
SIRET: 93044860000013
Email: gael_pro@ik.me
Tél: +33 6 33 36 40 94

FACTURÉ À:
${quote.client.firstName} ${quote.client.lastName}
${quote.client.email}
${quote.client.phone || ""}
${quote.client.address || ""}

DATE: ${new Date(quote.createdAt).toLocaleDateString("fr-FR")}
VALIDE JUSQU'AU: ${new Date(quote.validUntil).toLocaleDateString("fr-FR")}

PRESTATIONS:
${quote.items
  .map(
    (item) =>
      `${item.description} | Qté: ${
        item.quantity
      } | Prix: ${item.unitPrice.toFixed(
        2
      )}€ | Total: ${item.totalPrice.toFixed(2)}€`
  )
  .join("\n")}

TOTAUX:
Sous-total HT: ${quote.subtotal.toFixed(2)}€
TVA (${quote.vatRate}%): ${quote.vatAmount.toFixed(2)}€
TOTAL TTC: ${quote.totalAmount.toFixed(2)}€

${quote.notes ? `NOTES:\n${quote.notes}` : ""}

Merci pour votre confiance !
Ce devis est valable 30 jours à compter de sa date d'émission.
  `;

  // Créer un blob et télécharger
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Devis_${quote.quoteNumber}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
