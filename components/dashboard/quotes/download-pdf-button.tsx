// // components/dashboard/quotes/simple-download-button.tsx
// "use client";

// import { Button } from "@/components/ui/button";
// import { Quote } from "@/types/QuoteTypes";
// import { FileText, Loader2 } from "lucide-react";
// import React, { useState } from "react";
// import { toast } from "sonner";

// interface SimpleDownloadButtonProps {
//   quote: Quote;
//   variant?:
//     | "default"
//     | "destructive"
//     | "outline"
//     | "secondary"
//     | "ghost"
//     | "link";
//   size?: "default" | "sm" | "lg" | "icon";
//   className?: string;
//   children?: React.ReactNode;
// }

// export function SimpleDownloadButton({
//   quote,
//   variant = "outline",
//   size = "default",
//   className = "",
//   children,
// }: SimpleDownloadButtonProps) {
//   const [isLoading, setIsLoading] = useState(false);

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("fr-FR", {
//       style: "currency",
//       currency: "EUR",
//     }).format(amount);
//   };

//   const formatDate = (date: Date) => {
//     return new Intl.DateTimeFormat("fr-FR", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     }).format(date);
//   };

//   const handleDownload = async () => {
//     setIsLoading(true);

//     try {
//       const htmlContent = `
// <!DOCTYPE html>
// <html lang="fr">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Devis ${quote.quoteNumber}</title>
//     <style>
//         @page { margin: 20mm; }
//         * { margin: 0; padding: 0; box-sizing: border-box; }
//         body {
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//             line-height: 1.5; color: #2d3748; font-size: 12px;
//         }
//         .container { max-width: 800px; margin: 0 auto; }
//         .header {
//             display: flex; justify-content: space-between; align-items: flex-start;
//             margin-bottom: 30px; padding-bottom: 15px; border-bottom: 3px solid #7158ff;
//         }
//         .company h1 { color: #7158ff; font-size: 24px; margin-bottom: 8px; font-weight: bold; }
//         .company p { margin: 2px 0; font-size: 11px; }
//         .quote-info { text-align: right; }
//         .quote-info h2 { color: #7158ff; font-size: 28px; margin-bottom: 8px; letter-spacing: 1px; }
//         .quote-info p { margin: 2px 0; font-size: 11px; }
//         .client {
//             background: #f7fafc; padding: 15px; border-radius: 6px;
//             margin: 20px 0; border-left: 4px solid #7158ff;
//         }
//         .client h3 { color: #2d3748; margin-bottom: 8px; font-size: 14px; }
//         .client-name { font-weight: bold; font-size: 13px; margin-bottom: 4px; }
//         .items { width: 100%; border-collapse: collapse; margin: 20px 0; }
//         .items th {
//             background: #7158ff; color: white; padding: 10px 8px;
//             text-align: left; font-weight: bold; font-size: 11px;
//         }
//         .items th:nth-child(2), .items th:nth-child(3), .items th:nth-child(4) { text-align: right; }
//         .items td {
//             padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px;
//         }
//         .items td:nth-child(2), .items td:nth-child(3), .items td:nth-child(4) { text-align: right; }
//         .items tr:nth-child(even) { background: #f7fafc; }
//         .totals { display: flex; justify-content: flex-end; margin: 20px 0; }
//         .totals-box {
//             background: #f7fafc; padding: 15px; border-radius: 6px;
//             border: 1px solid #e2e8f0; min-width: 250px;
//         }
//         .total-line { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; }
//         .total-final {
//             display: flex; justify-content: space-between; padding: 8px 0;
//             margin-top: 6px; border-top: 2px solid #7158ff; font-weight: bold;
//             font-size: 14px; color: #7158ff;
//         }
//         .notes {
//             background: #fef5e7; padding: 12px; border-radius: 4px;
//             border-left: 3px solid #ed8936; margin: 20px 0;
//         }
//         .notes h3 { color: #c05621; margin-bottom: 6px; font-size: 12px; }
//         .notes p { color: #9c4221; font-size: 10px; }
//         .footer {
//             margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0;
//             text-align: center; font-size: 9px; color: #718096;
//         }
//         .footer .highlight { color: #7158ff; font-weight: bold; font-size: 11px; margin-bottom: 6px; }
//         @media print {
//             body { font-size: 11px; }
//             .header { break-inside: avoid; }
//             .items { break-inside: auto; }
//             .totals { break-inside: avoid; }
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <div class="header">
//             <div class="company">
//                 <h1>Gaël Richard</h1>
//                 <p>Développeur Freelance</p>
//                 <p>7 rue du pré de la ramée</p>
//                 <p>44550 Montoir De Bretagne</p>
//                 <p>SIRET: 93044860000013</p>
//                 <p>Email: gael_pro@ik.me</p>
//                 <p>Tél: +33 6 33 36 40 94</p>
//             </div>
//             <div class="quote-info">
//                 <h2>DEVIS</h2>
//                 <p><strong>N° ${quote.quoteNumber}</strong></p>
//                 <p>Date: ${formatDate(quote.createdAt)}</p>
//                 <p>Valide jusqu'au: ${formatDate(quote.validUntil)}</p>
//             </div>
//         </div>

//         <div class="client">
//             <h3>Facturé à :</h3>
//             <div class="client-name">${quote.client.firstName} ${
//         quote.client.lastName
//       }</div>
//             <p>${quote.client.email}</p>
//             ${quote.client.phone ? `<p>${quote.client.phone}</p>` : ""}
//             ${quote.client.address ? `<p>${quote.client.address}</p>` : ""}
//             <p><em>Type: ${
//               quote.client.isProfessional ? "Professionnel" : "Particulier"
//             }</em></p>
//         </div>

//         <table class="items">
//             <thead>
//                 <tr><th>Description</th><th>Qté</th><th>Prix unitaire</th><th>Total</th></tr>
//             </thead>
//             <tbody>
//                 ${quote.items
//                   .map(
//                     (item) => `
//                     <tr>
//                         <td><strong>${item.description}</strong></td>
//                         <td>${item.quantity}</td>
//                         <td>${formatCurrency(item.unitPrice)}</td>
//                         <td><strong>${formatCurrency(
//                           item.totalPrice
//                         )}</strong></td>
//                     </tr>
//                 `
//                   )
//                   .join("")}
//             </tbody>
//         </table>

//         <div class="totals">
//             <div class="totals-box">
//                 <div class="total-line"><span>Sous-total HT :</span><span>${formatCurrency(
//                   quote.subtotal
//                 )}</span></div>
//                 <div class="total-line"><span>TVA (${
//                   quote.vatRate
//                 }%) :</span><span>${formatCurrency(
//         quote.vatAmount
//       )}</span></div>
//                 <div class="total-final"><span>TOTAL TTC :</span><span>${formatCurrency(
//                   quote.totalAmount
//                 )}</span></div>
//             </div>
//         </div>

//         ${
//           quote.notes
//             ? `
//             <div class="notes">
//                 <h3>Notes importantes :</h3>
//                 <p>${quote.notes}</p>
//             </div>
//         `
//             : ""
//         }

//         <div class="footer">
//             <div class="highlight">Merci pour votre confiance !</div>
//             <p>Ce devis est valable 30 jours à compter de sa date d'émission.</p>
//             <p>Conditions de paiement : 30% à la commande, 70% à la livraison</p>
//             <p>En cas de questions, n'hésitez pas à me contacter.</p>
//         </div>
//     </div>

//     <script>
//         // Auto-impression après chargement
//         window.onload = function() {
//             setTimeout(() => {
//                 window.print();
//             }, 500);
//         };
//     </script>
// </body>
// </html>`;

//       // Créer et ouvrir dans une nouvelle fenêtre
//       const printWindow = window.open("", "_blank");
//       if (printWindow) {
//         printWindow.document.write(htmlContent);
//         printWindow.document.close();
//         toast.success("Document ouvert pour impression");
//       } else {
//         // Fallback: télécharger le fichier HTML
//         const blob = new Blob([htmlContent], {
//           type: "text/html;charset=utf-8",
//         });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement("a");
//         link.href = url;
//         link.download = `Devis_${quote.quoteNumber}.html`;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         URL.revokeObjectURL(url);
//         toast.success("Devis téléchargé (format HTML)");
//       }
//     } catch (error) {
//       console.error("Erreur lors de la génération:", error);
//       toast.error("Erreur lors de la génération du devis");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Button
//       variant={variant}
//       size={size}
//       className={className}
//       onClick={handleDownload}
//       disabled={isLoading}
//     >
//       {isLoading ? (
//         <Loader2 className="mr-2 size-4 animate-spin" />
//       ) : (
//         <FileText className="mr-2 size-4" />
//       )}
//       {isLoading ? "Génération..." : children || "Imprimer/Télécharger"}
//     </Button>
//   );
// }
