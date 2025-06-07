// components/dashboard/quotes/modern-minimal-pdf.tsx
"use client";

import { Quote } from "@/types/QuoteTypes";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";

// Styles modernes et minimalistes
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.6,
  },

  // En-tête épuré
  header: {
    marginBottom: 40,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },

  // Logo et infos entreprise
  companySection: {
    flex: 1,
  },

  logo: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
    letterSpacing: -1,
  },

  tagline: {
    fontSize: 12,
    color: "#7C3AED",
    marginBottom: 20,
    fontWeight: "500",
  },

  companyInfo: {
    fontSize: 9,
    color: "#6B7280",
    lineHeight: 1.5,
  },

  // Section devis moderne
  quoteSection: {
    alignItems: "flex-end",
  },

  quoteTitle: {
    fontSize: 48,
    fontWeight: "100",
    color: "#7C3AED",
    letterSpacing: 4,
    marginBottom: 8,
  },

  quoteSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "right",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // Ligne de séparation élégante
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 30,
  },

  // Informations du devis
  quoteInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    padding: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },

  quoteDetails: {
    flex: 1,
  },

  clientDetails: {
    flex: 1,
    paddingLeft: 20,
  },

  infoLabel: {
    fontSize: 8,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 11,
    color: "#111827",
    fontWeight: "500",
    marginBottom: 12,
  },

  clientName: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "bold",
    marginBottom: 8,
  },

  // Tableau minimaliste
  tableSection: {
    marginBottom: 30,
  },

  tableTitle: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    marginBottom: 20,
    letterSpacing: 0.5,
  },

  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#111827",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },

  tableHeaderText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  tableRowAlt: {
    backgroundColor: "#FAFAFA",
  },

  tableRowLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },

  // Colonnes optimisées
  colDescription: {
    width: "50%",
    paddingRight: 16,
  },

  colQuantity: {
    width: "15%",
    textAlign: "center",
  },

  colPrice: {
    width: "17.5%",
    textAlign: "right",
  },

  colTotal: {
    width: "17.5%",
    textAlign: "right",
  },

  itemName: {
    fontSize: 11,
    color: "#111827",
    fontWeight: "500",
    marginBottom: 2,
  },

  itemDescription: {
    fontSize: 9,
    color: "#6B7280",
    fontStyle: "italic",
  },

  quantityBadge: {
    backgroundColor: "#EEF2FF",
    color: "#5B21B6",
    fontSize: 10,
    fontWeight: "600",
    padding: "4 8",
    borderRadius: 12,
    textAlign: "center",
    alignSelf: "center",
  },

  priceText: {
    fontSize: 10,
    color: "#374151",
  },

  totalText: {
    fontSize: 11,
    color: "#111827",
    fontWeight: "600",
  },

  // Section totaux élégante
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    marginBottom: 40,
  },

  totalsBox: {
    width: 280,
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  totalLabel: {
    fontSize: 10,
    color: "#6B7280",
  },

  totalValue: {
    fontSize: 10,
    color: "#374151",
    fontWeight: "500",
  },

  subtotalRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 12,
    marginBottom: 12,
  },

  finalTotalRow: {
    backgroundColor: "#111827",
    marginHorizontal: -24,
    marginBottom: -24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },

  finalTotalLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 1,
  },

  finalTotalValue: {
    fontSize: 16,
    color: "#7C3AED",
    fontWeight: "bold",
  },

  // Notes design
  notesSection: {
    marginBottom: 40,
  },

  notesTitle: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
    marginBottom: 12,
  },

  notesBox: {
    backgroundColor: "#FFFBEB",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    padding: 16,
    borderRadius: 4,
  },

  notesText: {
    fontSize: 10,
    color: "#92400E",
    lineHeight: 1.6,
  },

  // Pied de page moderne
  footer: {
    marginTop: "auto",
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  footerGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footerColumn: {
    flex: 1,
    paddingRight: 20,
  },

  footerTitle: {
    fontSize: 10,
    color: "#111827",
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  footerText: {
    fontSize: 8,
    color: "#6B7280",
    lineHeight: 1.5,
    marginBottom: 4,
  },

  footerHighlight: {
    fontSize: 12,
    color: "#7C3AED",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20,
  },

  // Badges et éléments décoratifs
  statusBadge: {
    backgroundColor: "#10B981",
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "600",
    padding: "4 8",
    borderRadius: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    alignSelf: "flex-start",
    marginTop: 8,
  },

  accent: {
    color: "#7C3AED",
    fontWeight: "600",
  },
});

interface ModernMinimalPDFProps {
  quote: Quote;
}

const formatCurrencyLocal = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDateLocal = (date: Date): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

const formatDateShort = (date: Date): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

export const ModernMinimalPDF: React.FC<ModernMinimalPDFProps> = ({
  quote,
}) => {
  return (
    <Document
      title={`Devis ${quote.quoteNumber}`}
      author="Gaël Richard"
      subject={`Devis pour ${quote.client.firstName} ${quote.client.lastName}`}
      creator="Gaël Richard - Développeur Freelance"
    >
      <Page size="A4" style={styles.page}>
        {/* En-tête moderne */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.companySection}>
              <Text style={styles.logo}>Gaël Richard</Text>
              <Text style={styles.tagline}>Développeur Web Freelance</Text>

              <View style={styles.companyInfo}>
                <Text>7 rue du pré de la ramée</Text>
                <Text>44550 Montoir De Bretagne</Text>
                <Text>SIRET 93044860000013</Text>
                <Text>gael_pro@ik.me • +33 6 33 36 40 94</Text>
              </View>
            </View>

            <View style={styles.quoteSection}>
              <Text style={styles.quoteTitle}>DEVIS</Text>
              <Text style={styles.quoteSubtitle}>Estimation</Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Informations du devis */}
          <View style={styles.quoteInfo}>
            <View style={styles.quoteDetails}>
              <Text style={styles.infoLabel}>Numéro de devis</Text>
              <Text style={styles.infoValue}>{quote.quoteNumber}</Text>

              <Text style={styles.infoLabel}>Date d'émission</Text>
              <Text style={styles.infoValue}>
                {formatDateShort(quote.createdAt)}
              </Text>

              <Text style={styles.infoLabel}>Valide jusqu'au</Text>
              <Text style={styles.infoValue}>
                {formatDateShort(quote.validUntil)}
              </Text>
            </View>

            <View style={styles.clientDetails}>
              <Text style={styles.infoLabel}>Facturation</Text>
              <Text style={styles.clientName}>
                {quote.client.firstName} {quote.client.lastName}
              </Text>

              <View style={styles.companyInfo}>
                <Text>{quote.client.email}</Text>
                {quote.client.phone && <Text>{quote.client.phone}</Text>}
                {quote.client.address && <Text>{quote.client.address}</Text>}
              </View>

              <Text style={styles.statusBadge}>
                {quote.client.isProfessional ? "Professionnel" : "Particulier"}
              </Text>
            </View>
          </View>
        </View>

        {/* Tableau des prestations */}
        <View style={styles.tableSection}>
          <Text style={styles.tableTitle}>Prestations détaillées</Text>

          {/* En-tête */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQuantity]}>
              Qté
            </Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>
              Prix unitaire
            </Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>
              Total HT
            </Text>
          </View>

          {/* Lignes */}
          {quote.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                index % 2 === 1 && styles.tableRowAlt,
                index === quote.items.length - 1 && styles.tableRowLast,
              ]}
            >
              <View style={styles.colDescription}>
                <Text style={styles.itemName}>{item.description}</Text>
              </View>

              <View style={styles.colQuantity}>
                <Text style={styles.quantityBadge}>{item.quantity}</Text>
              </View>

              <Text style={[styles.priceText, styles.colPrice]}>
                {formatCurrencyLocal(item.unitPrice)}
              </Text>

              <Text style={[styles.totalText, styles.colTotal]}>
                {formatCurrencyLocal(item.totalPrice)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={[styles.totalRow, styles.subtotalRow]}>
              <Text style={styles.totalLabel}>Sous-total HT</Text>
              <Text style={styles.totalValue}>
                {formatCurrencyLocal(quote.subtotal)}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA ({quote.vatRate}%)</Text>
              <Text style={styles.totalValue}>
                {formatCurrencyLocal(quote.vatAmount)}
              </Text>
            </View>

            <View style={styles.finalTotalRow}>
              <View style={styles.totalRow}>
                <Text style={styles.finalTotalLabel}>TOTAL TTC</Text>
                <Text style={styles.finalTotalValue}>
                  {formatCurrencyLocal(quote.totalAmount)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notes si présentes */}
        {quote.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes importantes</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{quote.notes}</Text>
            </View>
          </View>
        )}

        {/* Pied de page */}
        <View style={styles.footer}>
          <View style={styles.footerGrid}>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Conditions</Text>
              <Text style={styles.footerText}>Devis valable 30 jours</Text>
              <Text style={styles.footerText}>
                Acompte de 30% à la commande
              </Text>
              <Text style={styles.footerText}>Solde à la livraison</Text>
            </View>

            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Informations</Text>
              <Text style={styles.footerText}>
                Délai de rétractation : 14 jours
              </Text>
              <Text style={styles.footerText}>
                Auto-entrepreneur dispensé d'immatriculation
              </Text>
              <Text style={styles.footerText}>au registre du commerce</Text>
            </View>

            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Contact</Text>
              <Text style={styles.footerText}>
                Pour toute question concernant
              </Text>
              <Text style={styles.footerText}>
                ce devis, n'hésitez pas à me contacter
              </Text>
              <Text style={styles.footerText}>par email ou téléphone</Text>
            </View>
          </View>

          <Text style={styles.footerHighlight}>
            Merci pour votre confiance ! ✨
          </Text>
        </View>
      </Page>
    </Document>
  );
};
