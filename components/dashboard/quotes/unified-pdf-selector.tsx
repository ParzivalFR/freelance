// components/dashboard/quotes/unified-pdf-selector.tsx
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
import { useState } from "react";
import { toast } from "sonner";

type PDFStyle = "professional" | "minimal" | "classic" | "simple";

interface PDFStyleConfig {
  name: string;
  description: string;
  icon: string;
}

const PDF_STYLES: Record<PDFStyle, PDFStyleConfig> = {
  professional: {
    name: "Professionnel",
    description: "Design moderne avec en-tête coloré",
    icon: "🎨",
  },
  minimal: {
    name: "Minimaliste",
    description: "Style épuré et élégant",
    icon: "✨",
  },
  classic: {
    name: "Classique",
    description: "Template simple et efficace",
    icon: "📄",
  },
  simple: {
    name: "HTML Imprimable",
    description: "Version HTML optimisée",
    icon: "🖨️",
  },
};

interface UnifiedPDFSelectorProps {
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

export function UnifiedPDFSelector({
  quote,
  variant = "outline",
  size = "default",
  className = "",
}: UnifiedPDFSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStyle, setLoadingStyle] = useState<PDFStyle | null>(null);

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

  // Template HTML professionnel
  const generateProfessionalHTML = () => {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devis ${quote.quoteNumber} - Professionnel</title>
    <style>
        @page { margin: 15mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            line-height: 1.6; color: #1f2937; font-size: 11px;
            background: linear-gradient(135deg, #1a1a2e 0%, #7158ff 100%);
            min-height: 100vh; padding: 20px;
        }
        .document {
            max-width: 800px; margin: 0 auto; background: white;
            border-radius: 16px; overflow: hidden; 
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        }
        .header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white; padding: 40px; position: relative;
        }
        .header::after {
            content: ''; position: absolute; bottom: 0; left: 0; right: 0;
            height: 6px; background: linear-gradient(90deg, #7c3aed, #06b6d4, #10b981);
        }
        .header-content { 
            display: flex; justify-content: space-between; align-items: flex-start; 
        }
        .company h1 { 
            font-size: 32px; font-weight: 700; margin-bottom: 6px; 
            background: linear-gradient(45deg, #fff, #7c3aed);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .company .tagline { 
            color: #7c3aed; font-size: 16px; margin-bottom: 20px; 
            font-weight: 600; letter-spacing: 1px;
        }
        .company-info { font-size: 12px; opacity: 0.9; line-height: 1.6; }
        .quote-box {
            background: rgba(255,255,255,0.15); backdrop-filter: blur(15px);
            padding: 25px; border-radius: 12px; text-align: right; min-width: 220px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .quote-title { 
            font-size: 28px; font-weight: 300; letter-spacing: 3px; 
            margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .quote-number { 
            font-size: 18px; font-weight: 600; margin-bottom: 15px; 
        }
        .quote-dates { font-size: 11px; opacity: 0.8; }
        .content { padding: 40px; }
        .info-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 30px;
            margin-bottom: 35px; padding: 25px; 
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
            border-radius: 12px; border: 1px solid #e2e8f0;
        }
        .info-section h3 {
            font-size: 13px; color: #6b7280; text-transform: uppercase;
            letter-spacing: 0.8px; margin-bottom: 10px; font-weight: 700;
        }
        .client-name { 
            font-size: 18px; font-weight: 700; color: #1f2937; 
            margin-bottom: 10px; 
        }
        .client-info { font-size: 12px; color: #4b5563; line-height: 1.6; }
        .client-type {
            display: inline-block; 
            background: linear-gradient(45deg, #7c3aed, #3b82f6);
            color: white; padding: 6px 15px; border-radius: 20px; 
            font-size: 10px; font-weight: 600; margin-top: 10px;
            box-shadow: 0 4px 8px rgba(124, 58, 237, 0.3);
        }
        .section-title {
            font-size: 20px; font-weight: 600; color: #1f2937;
            margin: 35px 0 20px 0; position: relative; padding-bottom: 10px;
        }
        .section-title::after {
            content: ''; position: absolute; bottom: 0; left: 0;
            width: 80px; height: 3px; 
            background: linear-gradient(90deg, #7c3aed, #3b82f6);
            border-radius: 2px;
        }
        .table {
            width: 100%; border-collapse: collapse; margin: 25px 0;
            border-radius: 12px; overflow: hidden; 
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .table thead { 
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%); 
        }
        .table th {
            padding: 16px 20px; text-align: left; font-weight: 700;
            font-size: 11px; color: white; text-transform: uppercase; 
            letter-spacing: 0.8px;
        }
        .table th:nth-child(2), .table th:nth-child(3), .table th:nth-child(4) { 
            text-align: right; 
        }
        .table td {
            padding: 16px 20px; border-bottom: 1px solid #f3f4f6; 
            font-size: 12px;
        }
        .table td:nth-child(2), .table td:nth-child(3), .table td:nth-child(4) { 
            text-align: right; 
        }
        .table tbody tr:nth-child(even) { background: #f9fafb; }
        .table tbody tr:hover { background: #f3f4f6; transition: all 0.2s; }
        .item-name { font-weight: 700; color: #1f2937; }
        .quantity-badge {
            background: linear-gradient(45deg, #ede9fe, #ddd6fe); 
            color: #7c3aed; padding: 6px 12px;
            border-radius: 8px; font-weight: 700; font-size: 11px;
            box-shadow: 0 2px 4px rgba(124, 58, 237, 0.2);
        }
        .totals {
            display: flex; justify-content: flex-end; margin: 35px 0;
        }
        .totals-card {
            background: linear-gradient(135deg, white 0%, #f8fafc 100%); 
            border: 2px solid #e5e7eb; border-radius: 12px;
            padding: 30px; min-width: 320px; 
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .total-line {
            display: flex; justify-content: space-between; padding: 10px 0;
            font-size: 13px; color: #6b7280;
        }
        .total-line.subtotal { 
            border-bottom: 2px solid #f3f4f6; margin-bottom: 15px; 
        }
        .total-final {
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%); 
            margin: -30px -30px -30px -30px;
            padding: 25px 30px; border-radius: 0 0 12px 12px;
        }
        .total-final .total-line { 
            color: white; font-size: 16px; font-weight: 700; 
        }
        .total-final .amount { 
            color: #7c3aed; font-size: 20px; font-weight: 900; 
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .notes {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 6px solid #f59e0b; padding: 25px; border-radius: 12px;
            margin: 35px 0; box-shadow: 0 4px 8px rgba(245, 158, 11, 0.2);
        }
        .notes h3 { 
            color: #92400e; font-weight: 700; margin-bottom: 10px; 
            font-size: 14px;
        }
        .notes p { color: #92400e; line-height: 1.7; }
        .footer {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
            padding: 35px; text-align: center;
            border-top: 2px solid #e5e7eb;
        }
        .footer-highlight {
            font-size: 18px; color: #7c3aed; font-weight: 700;
            margin-bottom: 20px; text-shadow: 0 2px 4px rgba(124, 58, 237, 0.3);
        }
        .footer-grid {
            display: grid; grid-template-columns: repeat(3, 1fr);
            gap: 25px; margin-bottom: 25px; text-align: left;
        }
        .footer-section h4 {
            font-size: 11px; color: #1f2937; font-weight: 700;
            text-transform: uppercase; margin-bottom: 10px; 
            letter-spacing: 0.8px;
        }
        .footer-section p {
            font-size: 10px; color: #6b7280; line-height: 1.6; 
            margin-bottom: 5px;
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
                    <div style="font-size: 13px; line-height: 1.7;">
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
                            <td><span class="item-name">${
                              item.description
                            }</span></td>
                            <td><span class="quantity-badge">${
                              item.quantity
                            }</span></td>
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
        window.onload = () => setTimeout(() => window.print(), 500);
    </script>
</body>
</html>`;
  };

  // Template HTML minimaliste
  const generateMinimalHTML = () => {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devis ${quote.quoteNumber} - Minimaliste</title>
    <style>
        @page { margin: 20mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            line-height: 1.7; color: #111827; font-size: 10px;
            background: #f9fafb; padding: 20px;
        }
        .document {
            max-width: 760px; margin: 0 auto; background: white;
            border-radius: 2px; overflow: hidden; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
        }
        .header {
            padding: 60px 50px 40px 50px; border-bottom: 1px solid #f3f4f6;
        }
        .header-top {
            display: flex; justify-content: space-between; align-items: flex-start;
            margin-bottom: 40px;
        }
        .company h1 { 
            font-size: 36px; font-weight: 100; color: #000; 
            margin-bottom: 4px; letter-spacing: -1px;
        }
        .company .tagline { 
            color: #7c3aed; font-size: 12px; margin-bottom: 24px; 
            font-weight: 500; letter-spacing: 0.5px;
        }
        .company-info { 
            font-size: 9px; color: #6b7280; line-height: 1.6; 
        }
        .quote-section {
            text-align: right;
        }
        .quote-title { 
            font-size: 48px; font-weight: 100; color: #7c3aed; 
            letter-spacing: 4px; margin-bottom: 8px;
        }
        .quote-subtitle {
            font-size: 11px; color: #6b7280; letter-spacing: 1px;
            text-transform: uppercase;
        }
        .separator {
            height: 1px; background: #e5e7eb; margin: 30px 0;
        }
        .quote-info {
            display: flex; justify-content: space-between; 
            padding: 20px; background: #f8fafc; border-radius: 4px;
        }
        .quote-details, .client-details {
            flex: 1;
        }
        .client-details {
            padding-left: 20px;
        }
        .info-label {
            font-size: 8px; color: #9ca3af; text-transform: uppercase; 
            letter-spacing: 0.5px; margin-bottom: 4px;
        }
        .info-value {
            font-size: 11px; color: #111827; font-weight: 500; 
            margin-bottom: 12px;
        }
        .client-name {
            font-size: 14px; color: #111827; font-weight: 600; 
            margin-bottom: 8px;
        }
        .status-badge {
            background: #10b981; color: white; font-size: 8px; 
            padding: 3px 8px; border-radius: 12px; font-weight: 600;
            text-transform: uppercase; letter-spacing: 0.5px;
        }
        .content { padding: 50px; }
        .section-title {
            font-size: 14px; color: #111827; font-weight: 600; 
            margin-bottom: 20px; letter-spacing: 0.5px;
        }
        .table-container {
            border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;
        }
        .table-header {
            background: #111827; padding: 12px 16px; 
            display: flex; color: white;
        }
        .table-header-text {
            font-size: 9px; font-weight: 600; text-transform: uppercase; 
            letter-spacing: 0.5px;
        }
        .table-row {
            display: flex; padding: 16px; border-bottom: 1px solid #f3f4f6;
            min-height: 50px; align-items: center;
        }
        .table-row:nth-child(even) { background: #fafafa; }
        .table-row:last-child { border-bottom: none; border-radius: 0 0 4px 4px; }
        .col-description { width: 50%; padding-right: 16px; }
        .col-quantity { width: 15%; text-align: center; }
        .col-price { width: 17.5%; text-align: right; }
        .col-total { width: 17.5%; text-align: right; }
        .item-name {
            font-size: 11px; color: #111827; font-weight: 500; 
            margin-bottom: 2px;
        }
        .quantity-badge {
            background: #eef2ff; color: #5b21b6; font-size: 10px; 
            font-weight: 600; padding: 4px 8px; border-radius: 12px;
        }
        .price-text { font-size: 10px; color: #374151; }
        .total-text { font-size: 11px; color: #111827; font-weight: 600; }
        .totals-section {
            display: flex; justify-content: flex-end; margin: 20px 0 40px 0;
        }
        .totals-box {
            width: 280px; padding: 24px; background: white; 
            border: 1px solid #e5e7eb; border-radius: 4px;
        }
        .total-row {
            display: flex; justify-content: space-between; padding: 6px 0;
        }
        .total-label { font-size: 10px; color: #6b7280; }
        .total-value { font-size: 10px; color: #374151; font-weight: 500; }
        .subtotal-row {
            border-bottom: 1px solid #f3f4f6; padding-bottom: 12px; 
            margin-bottom: 12px;
        }
        .final-total-row {
            background: #111827; margin: -24px -24px -24px -24px; 
            padding: 16px 24px; border-radius: 0 0 4px 4px;
        }
        .final-total-label {
            font-size: 12px; color: white; font-weight: 600; 
            letter-spacing: 1px;
        }
        .final-total-value {
            font-size: 16px; color: #7c3aed; font-weight: 700;
        }
        .notes-section { margin-bottom: 40px; }
        .notes-box {
            background: #fffbeb; border-left: 4px solid #f59e0b; 
            padding: 16px; border-radius: 4px;
        }
        .notes-title {
            font-size: 12px; color: #111827; font-weight: 600; 
            margin-bottom: 12px;
        }
        .notes-text {
            font-size: 10px; color: #92400e; line-height: 1.6;
        }
        .footer {
            padding: 30px; border-top: 1px solid #f3f4f6;
        }
        .footer-grid {
            display: flex; justify-content: space-between;
        }
        .footer-column {
            flex: 1; padding-right: 20px;
        }
        .footer-title {
            font-size: 10px; color: #111827; font-weight: 600; 
            margin-bottom: 8px; text-transform: uppercase; 
            letter-spacing: 0.5px;
        }
        .footer-text {
            font-size: 8px; color: #6b7280; line-height: 1.5; 
            margin-bottom: 4px;
        }
        .footer-highlight {
            font-size: 12px; color: #7c3aed; font-weight: 600; 
            text-align: center; margin-top: 20px;
        }
        @media print {
            body { background: white !important; padding: 0 !important; }
            .document { box-shadow: none !important; }
        }
    </style>
</head>
<body>
    <div class="document">
        <div class="header">
            <div class="header-top">
                <div class="company">
                    <h1>Gaël Richard</h1>
                    <div class="tagline">Développeur Web Freelance</div>
                    <div class="company-info">
                        <div>7 rue du pré de la ramée</div>
                        <div>44550 Montoir De Bretagne</div>
                        <div>SIRET 93044860000013</div>
                        <div>gael_pro@ik.me • +33 6 33 36 40 94</div>
                    </div>
                </div>
                <div class="quote-section">
                    <div class="quote-title">DEVIS</div>
                    <div class="quote-subtitle">Estimation</div>
                </div>
            </div>
            
            <div class="separator"></div>
            
            <div class="quote-info">
                <div class="quote-details">
                    <div class="info-label">Numéro de devis</div>
                    <div class="info-value">${quote.quoteNumber}</div>
                    
                    <div class="info-label">Date d'émission</div>
                    <div class="info-value">${formatDate(quote.createdAt)}</div>
                    
                    <div class="info-label">Valide jusqu'au</div>
                    <div class="info-value">${formatDate(
                      quote.validUntil
                    )}</div>
                </div>
                
                <div class="client-details">
                    <div class="info-label">Facturation</div>
                    <div class="client-name">${quote.client.firstName} ${
      quote.client.lastName
    }</div>
                    <div class="company-info">
                        <div>${quote.client.email}</div>
                        ${
                          quote.client.phone
                            ? `<div>${quote.client.phone}</div>`
                            : ""
                        }
                        ${
                          quote.client.address
                            ? `<div>${quote.client.address}</div>`
                            : ""
                        }
                    </div>
                    <div class="status-badge">
                        ${
                          quote.client.isProfessional
                            ? "Professionnel"
                            : "Particulier"
                        }
                    </div>
                </div>
            </div>
        </div>
        
        <div class="content">
            <div class="section-title">Prestations détaillées</div>
            
            <div class="table-container">
                <div class="table-header">
                    <div class="table-header-text col-description">Description</div>
                    <div class="table-header-text col-quantity">Qté</div>
                    <div class="table-header-text col-price">Prix unitaire</div>
                    <div class="table-header-text col-total">Total HT</div>
                </div>
                
                ${quote.items
                  .map(
                    (item, index) => `
                    <div class="table-row">
                        <div class="col-description">
                            <div class="item-name">${item.description}</div>
                        </div>
                        <div class="col-quantity">
                            <span class="quantity-badge">${item.quantity}</span>
                        </div>
                        <div class="price-text col-price">${formatCurrency(
                          item.unitPrice
                        )}</div>
                        <div class="total-text col-total">${formatCurrency(
                          item.totalPrice
                        )}</div>
                    </div>
                `
                  )
                  .join("")}
            </div>
            
            <div class="totals-section">
                <div class="totals-box">
                    <div class="total-row subtotal-row">
                        <span class="total-label">Sous-total HT</span>
                        <span class="total-value">${formatCurrency(
                          quote.subtotal
                        )}</span>
                    </div>
                    <div class="total-row">
                        <span class="total-label">TVA (${quote.vatRate}%)</span>
                        <span class="total-value">${formatCurrency(
                          quote.vatAmount
                        )}</span>
                    </div>
                    <div class="final-total-row">
                        <div class="total-row">
                            <span class="final-total-label">TOTAL TTC</span>
                            <span class="final-total-value">${formatCurrency(
                              quote.totalAmount
                            )}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            ${
              quote.notes
                ? `
                <div class="notes-section">
                    <div class="notes-title">Notes importantes</div>
                    <div class="notes-box">
                        <div class="notes-text">${quote.notes}</div>
                    </div>
                </div>
            `
                : ""
            }
        </div>
        
        <div class="footer">
            <div class="footer-grid">
                <div class="footer-column">
                    <div class="footer-title">Conditions</div>
                    <div class="footer-text">Devis valable 30 jours</div>
                    <div class="footer-text">Acompte de 30% à la commande</div>
                    <div class="footer-text">Solde à la livraison</div>
                </div>
                <div class="footer-column">
                    <div class="footer-title">Informations</div>
                    <div class="footer-text">Délai de rétractation : 14 jours</div>
                    <div class="footer-text">Auto-entrepreneur dispensé</div>
                    <div class="footer-text">d'immatriculation au registre</div>
                </div>
                <div class="footer-column">
                    <div class="footer-title">Contact</div>
                    <div class="footer-text">Pour toute question concernant</div>
                    <div class="footer-text">ce devis, n'hésitez pas à me contacter</div>
                    <div class="footer-text">par email ou téléphone</div>
                </div>
            </div>
            <div class="footer-highlight">Merci pour votre confiance ! ✨</div>
        </div>
    </div>
    
    <script>
        window.onload = () => setTimeout(() => window.print(), 500);
    </script>
</body>
</html>`;
  };

  // Template HTML classique
  const generateClassicHTML = () => {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devis ${quote.quoteNumber} - Classique</title>
    <style>
        @page { margin: 20mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6; color: #2d3748; font-size: 12px;
            background: white; padding: 20px;
        }
        .document {
            max-width: 800px; margin: 0 auto; background: white;
            border: 2px solid #2d3748; padding: 30px;
        }
        .header {
            border-bottom: 3px double #2d3748; padding-bottom: 20px; 
            margin-bottom: 30px;
        }
        .header-content {
            display: flex; justify-content: space-between; align-items: flex-start;
        }
        .company h1 { 
            font-size: 24px; font-weight: bold; color: #2d3748; 
            margin-bottom: 8px; text-decoration: underline;
        }
        .company-info { 
            font-size: 11px; color: #2d3748; line-height: 1.5; 
        }
        .quote-section {
            text-align: center; border: 2px solid #2d3748; 
            padding: 15px; background: #f7fafc;
        }
        .quote-title { 
            font-size: 20px; font-weight: bold; color: #2d3748; 
            margin-bottom: 10px; text-decoration: underline;
        }
        .quote-info { font-size: 11px; color: #2d3748; }
        .client-section {
            margin-bottom: 25px; border: 1px solid #2d3748; 
            padding: 15px; background: #f7fafc;
        }
        .section-title {
            font-size: 14px; font-weight: bold; color: #2d3748;
            margin-bottom: 10px; text-decoration: underline;
        }
        .client-name { 
            font-size: 13px; font-weight: bold; color: #2d3748; 
            margin-bottom: 8px; 
        }
        .client-info { font-size: 11px; color: #2d3748; line-height: 1.5; }
        .table {
            width: 100%; border-collapse: collapse; margin: 20px 0;
            border: 2px solid #2d3748;
        }
        .table th, .table td {
            border: 1px solid #2d3748; padding: 10px; text-align: left;
        }
        .table th {
            background: #2d3748; color: white; font-weight: bold;
            text-align: center;
        }
        .table td:nth-child(2), .table td:nth-child(3), .table td:nth-child(4) { 
            text-align: right; 
        }
        .table tbody tr:nth-child(even) { background: #f7fafc; }
        .item-description { font-weight: bold; }
        .totals {
            display: flex; justify-content: flex-end; margin: 25px 0;
        }
        .totals-box {
            border: 2px solid #2d3748; padding: 20px; 
            background: #f7fafc; min-width: 250px;
        }
        .total-line {
            display: flex; justify-content: space-between; 
            padding: 5px 0; font-size: 12px;
        }
        .total-line.final {
            border-top: 2px solid #2d3748; margin-top: 10px; 
            padding-top: 10px; font-weight: bold; font-size: 14px;
        }
        .notes {
            border: 1px solid #2d3748; padding: 15px; 
            background: #f7fafc; margin: 25px 0;
        }
        .notes h3 { 
            font-weight: bold; margin-bottom: 8px; 
            text-decoration: underline; 
        }
        .footer {
            margin-top: 30px; padding-top: 20px; 
            border-top: 3px double #2d3748; text-align: center;
        }
        .footer-text {
            font-size: 10px; color: #2d3748; line-height: 1.5; 
            margin-bottom: 5px;
        }
        .footer-highlight {
            font-size: 12px; font-weight: bold; color: #2d3748; 
            margin-bottom: 15px;
        }
        @media print {
            body { padding: 0 !important; }
        }
    </style>
</head>
<body>
    <div class="document">
        <div class="header">
            <div class="header-content">
                <div class="company">
                    <h1>Gaël Richard</h1>
                    <div class="company-info">
                        <div><strong>Développeur Freelance</strong></div>
                        <div>7 rue du pré de la ramée</div>
                        <div>44550 Montoir De Bretagne</div>
                        <div>SIRET: 93044860000013</div>
                        <div>Email: gael_pro@ik.me</div>
                        <div>Tél: +33 6 33 36 40 94</div>
                    </div>
                </div>
                <div class="quote-section">
                    <div class="quote-title">DEVIS</div>
                    <div class="quote-info">
                        <div><strong>N° ${quote.quoteNumber}</strong></div>
                        <div>Date: ${formatDate(quote.createdAt)}</div>
                        <div>Valide jusqu'au: ${formatDate(
                          quote.validUntil
                        )}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="client-section">
            <div class="section-title">FACTURÉ À :</div>
            <div class="client-name">${quote.client.firstName} ${
      quote.client.lastName
    }</div>
            <div class="client-info">
                <div>${quote.client.email}</div>
                ${quote.client.phone ? `<div>${quote.client.phone}</div>` : ""}
                ${
                  quote.client.address
                    ? `<div>${quote.client.address}</div>`
                    : ""
                }
                <div><em>Type: ${
                  quote.client.isProfessional ? "Professionnel" : "Particulier"
                }</em></div>
            </div>
        </div>
        
        <div class="section-title">PRESTATIONS :</div>
        <table class="table">
            <thead>
                <tr>
                    <th>DESCRIPTION</th>
                    <th>QTÉ</th>
                    <th>PRIX UNITAIRE</th>
                    <th>TOTAL</th>
                </tr>
            </thead>
            <tbody>
                ${quote.items
                  .map(
                    (item) => `
                    <tr>
                        <td><span class="item-description">${
                          item.description
                        }</span></td>
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
            <div class="totals-box">
                <div class="total-line">
                    <span>Sous-total HT :</span>
                    <span>${formatCurrency(quote.subtotal)}</span>
                </div>
                <div class="total-line">
                    <span>TVA (${quote.vatRate}%) :</span>
                    <span>${formatCurrency(quote.vatAmount)}</span>
                </div>
                <div class="total-line final">
                    <span>TOTAL TTC :</span>
                    <span>${formatCurrency(quote.totalAmount)}</span>
                </div>
            </div>
        </div>
        
        ${
          quote.notes
            ? `
            <div class="notes">
                <h3>NOTES :</h3>
                <p>${quote.notes}</p>
            </div>
        `
            : ""
        }
        
        <div class="footer">
            <div class="footer-highlight">Merci pour votre confiance !</div>
            <div class="footer-text">Ce devis est valable 30 jours à compter de sa date d'émission.</div>
            <div class="footer-text">Conditions de paiement : 30% à la commande, 70% à la livraison</div>
            <div class="footer-text">Délai de rétractation : 14 jours conformément au Code de la consommation</div>
            <div class="footer-text">Auto-entrepreneur dispensé d'immatriculation au registre du commerce</div>
        </div>
    </div>
    
    <script>
        window.onload = () => setTimeout(() => window.print(), 500);
    </script>
</body>
</html>`;
  };

  // Version simple (reprise de ton SimpleDownloadButton)
  const generateSimpleHTML = () => {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devis ${quote.quoteNumber}</title>
    <style>
        @page { margin: 20mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.5; color: #2d3748; font-size: 12px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header {
            display: flex; justify-content: space-between; align-items: flex-start;
            margin-bottom: 30px; padding-bottom: 15px; border-bottom: 3px solid #7158ff;
        }
        .company h1 { color: #7158ff; font-size: 24px; margin-bottom: 8px; font-weight: bold; }
        .company p { margin: 2px 0; font-size: 11px; }
        .quote-info { text-align: right; }
        .quote-info h2 { color: #7158ff; font-size: 28px; margin-bottom: 8px; letter-spacing: 1px; }
        .quote-info p { margin: 2px 0; font-size: 11px; }
        .client {
            background: #f7fafc; padding: 15px; border-radius: 6px;
            margin: 20px 0; border-left: 4px solid #7158ff;
        }
        .client h3 { color: #2d3748; margin-bottom: 8px; font-size: 14px; }
        .client-name { font-weight: bold; font-size: 13px; margin-bottom: 4px; }
        .items { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items th {
            background: #7158ff; color: white; padding: 10px 8px;
            text-align: left; font-weight: bold; font-size: 11px;
        }
        .items th:nth-child(2), .items th:nth-child(3), .items th:nth-child(4) { text-align: right; }
        .items td {
            padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px;
        }
        .items td:nth-child(2), .items td:nth-child(3), .items td:nth-child(4) { text-align: right; }
        .items tr:nth-child(even) { background: #f7fafc; }
        .totals { display: flex; justify-content: flex-end; margin: 20px 0; }
        .totals-box {
            background: #f7fafc; padding: 15px; border-radius: 6px;
            border: 1px solid #e2e8f0; min-width: 250px;
        }
        .total-line { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; }
        .total-final {
            display: flex; justify-content: space-between; padding: 8px 0;
            margin-top: 6px; border-top: 2px solid #7158ff; font-weight: bold;
            font-size: 14px; color: #7158ff;
        }
        .notes {
            background: #fef5e7; padding: 12px; border-radius: 4px;
            border-left: 3px solid #ed8936; margin: 20px 0;
        }
        .notes h3 { color: #c05621; margin-bottom: 6px; font-size: 12px; }
        .notes p { color: #9c4221; font-size: 10px; }
        .footer {
            margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0;
            text-align: center; font-size: 9px; color: #718096;
        }
        .footer .highlight { color: #7158ff; font-weight: bold; font-size: 11px; margin-bottom: 6px; }
        @media print {
            body { font-size: 11px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company">
                <h1>Gaël Richard</h1>
                <p>Développeur Freelance</p>
                <p>7 rue du pré de la ramée</p>
                <p>44550 Montoir De Bretagne</p>
                <p>SIRET: 93044860000013</p>
                <p>Email: gael_pro@ik.me</p>
                <p>Tél: +33 6 33 36 40 94</p>
            </div>
            <div class="quote-info">
                <h2>DEVIS</h2>
                <p><strong>N° ${quote.quoteNumber}</strong></p>
                <p>Date: ${formatDate(quote.createdAt)}</p>
                <p>Valide jusqu'au: ${formatDate(quote.validUntil)}</p>
            </div>
        </div>

        <div class="client">
            <h3>Facturé à :</h3>
            <div class="client-name">${quote.client.firstName} ${
      quote.client.lastName
    }</div>
            <p>${quote.client.email}</p>
            ${quote.client.phone ? `<p>${quote.client.phone}</p>` : ""}
            ${quote.client.address ? `<p>${quote.client.address}</p>` : ""}
            <p><em>Type: ${
              quote.client.isProfessional ? "Professionnel" : "Particulier"
            }</em></p>
        </div>

        <table class="items">
            <thead>
                <tr><th>Description</th><th>Qté</th><th>Prix unitaire</th><th>Total</th></tr>
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
            <div class="totals-box">
                <div class="total-line"><span>Sous-total HT :</span><span>${formatCurrency(
                  quote.subtotal
                )}</span></div>
                <div class="total-line"><span>TVA (${
                  quote.vatRate
                }%) :</span><span>${formatCurrency(
      quote.vatAmount
    )}</span></div>
                <div class="total-final"><span>TOTAL TTC :</span><span>${formatCurrency(
                  quote.totalAmount
                )}</span></div>
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
            <div class="highlight">Merci pour votre confiance !</div>
            <p>Ce devis est valable 30 jours à compter de sa date d'émission.</p>
            <p>Conditions de paiement : 30% à la commande, 70% à la livraison</p>
            <p>En cas de questions, n'hésitez pas à me contacter.</p>
        </div>
    </div>

    <script>
        window.onload = function() {
            setTimeout(() => {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>`;
  };

  const handleDownload = async (style: PDFStyle) => {
    setIsLoading(true);
    setLoadingStyle(style);

    try {
      let htmlContent = "";
      let fileName = "";

      switch (style) {
        case "professional":
          htmlContent = generateProfessionalHTML();
          fileName = `Devis_${quote.quoteNumber}_Professionnel.html`;
          break;
        case "minimal":
          htmlContent = generateMinimalHTML();
          fileName = `Devis_${quote.quoteNumber}_Minimaliste.html`;
          break;
        case "classic":
          htmlContent = generateClassicHTML();
          fileName = `Devis_${quote.quoteNumber}_Classique.html`;
          break;
        case "simple":
          htmlContent = generateSimpleHTML();
          fileName = `Devis_${quote.quoteNumber}_Simple.html`;
          break;
      }

      // Essayer d'ouvrir dans une nouvelle fenêtre pour impression
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        toast.success(`Style ${PDF_STYLES[style].name} ouvert pour impression`);
      } else {
        // Fallback: télécharger le fichier
        const blob = new Blob([htmlContent], {
          type: "text/html;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Devis téléchargé (${PDF_STYLES[style].name})`);
      }
    } catch (error) {
      console.error("Erreur lors de la génération:", error);
      toast.error("Erreur lors de la génération du devis");
    } finally {
      setIsLoading(false);
      setLoadingStyle(null);
    }
  };

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
            onClick={() => handleDownload(key as PDFStyle)}
            disabled={isLoading}
            className="flex flex-col items-start gap-1 p-3"
          >
            <div className="flex w-full items-center gap-2">
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
