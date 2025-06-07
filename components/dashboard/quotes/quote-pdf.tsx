// components/dashboard/quotes/improved-quote-pdf.tsx
"use client";

import { Quote } from "@/types/QuoteTypes";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";

// Enregistrer les polices (optionnel, améliore l'apparence)
// Font.register({
//   family: 'Roboto',
//   src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
// });

// Styles optimisés pour PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
  },

  // En-tête
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: "#7158ff",
  },

  companySection: {
    flex: 1,
  },

  companyName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#7158ff",
    marginBottom: 8,
  },

  companyDetails: {
    fontSize: 11,
    color: "#374151",
    lineHeight: 1.6,
  },

  quoteSection: {
    alignItems: "flex-end",
    flex: 1,
  },

  quoteTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#7158ff",
    marginBottom: 15,
    letterSpacing: 2,
  },

  quoteInfo: {
    fontSize: 12,
    textAlign: "right",
    lineHeight: 1.6,
  },

  // Informations client
  clientSection: {
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  clientBox: {
    backgroundColor: "#f8fafc",
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  clientName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },

  clientDetails: {
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 1.5,
  },

  // Tableau
  table: {
    marginBottom: 30,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#7158ff",
    padding: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },

  tableHeaderText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 11,
  },

  tableRow: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    minHeight: 40,
  },

  tableRowEven: {
    backgroundColor: "#f9fafb",
  },

  // Colonnes du tableau
  colDescription: {
    width: "45%",
    paddingRight: 8,
  },

  colQuantity: {
    width: "15%",
    textAlign: "center",
  },

  colUnitPrice: {
    width: "20%",
    textAlign: "right",
  },

  colTotal: {
    width: "20%",
    textAlign: "right",
    fontWeight: "bold",
  },

  // Totaux
  totalsContainer: {
    alignItems: "flex-end",
    marginBottom: 30,
  },

  totalsBox: {
    width: 300,
    backgroundColor: "#f8fafc",
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    fontSize: 11,
  },

  totalRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#7158ff",
    fontSize: 16,
    fontWeight: "bold",
    color: "#7158ff",
  },

  // Notes
  notesSection: {
    marginBottom: 30,
  },

  notesBox: {
    backgroundColor: "#fef3c7",
    padding: 15,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },

  notesText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#92400e",
  },

  // Pied de page
  footer: {
    marginTop: "auto",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    textAlign: "center",
  },

  footerText: {
    fontSize: 9,
    color: "#6b7280",
    lineHeight: 1.4,
    marginBottom: 4,
  },

  footerHighlight: {
    fontSize: 10,
    color: "#7158ff",
    fontWeight: "bold",
  },
});

// Types
interface QuotePDFProps {
  quote: Quote;
}

// Fonctions utilitaires
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

// Composant principal PDF
export const QuotePDF: React.FC<QuotePDFProps> = ({ quote }) => {
  return (
    <Document
      title={`Devis ${quote.quoteNumber}`}
      author="Gaël Richard - Développeur Freelance"
      subject={`Devis pour ${quote.client.firstName} ${quote.client.lastName}`}
      creator="Application de gestion Gaël Richard"
    >
      <Page size="A4" style={styles.page}>
        {/* En-tête avec infos entreprise et devis */}
        <View style={styles.header}>
          <View style={styles.companySection}>
            <Text style={styles.companyName}>Gaël Richard</Text>
            <View style={styles.companyDetails}>
              <Text>Développeur Freelance</Text>
              <Text>7 rue du pré de la ramée</Text>
              <Text>44550 Montoir De Bretagne</Text>
              <Text>SIRET: 93044860000013</Text>
              <Text>Email: gael_pro@ik.me</Text>
              <Text>Tél: +33 6 33 36 40 94</Text>
            </View>
          </View>

          <View style={styles.quoteSection}>
            <Text style={styles.quoteTitle}>DEVIS</Text>
            <View style={styles.quoteInfo}>
              <Text>N° {quote.quoteNumber}</Text>
              <Text>Date: {formatDateLocal(quote.createdAt)}</Text>
              <Text>Valide jusqu'au: {formatDateLocal(quote.validUntil)}</Text>
            </View>
          </View>
        </View>

        {/* Informations client */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>Facturé à :</Text>
          <View style={styles.clientBox}>
            <Text style={styles.clientName}>
              {quote.client.firstName} {quote.client.lastName}
            </Text>
            <View style={styles.clientDetails}>
              <Text>{quote.client.email}</Text>
              {quote.client.phone && <Text>{quote.client.phone}</Text>}
              {quote.client.address && <Text>{quote.client.address}</Text>}
              <Text>
                Type:{" "}
                {quote.client.isProfessional ? "Professionnel" : "Particulier"}
              </Text>
            </View>
          </View>
        </View>

        {/* Tableau des prestations */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Prestations :</Text>

          {/* En-tête du tableau */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQuantity]}>
              Qté
            </Text>
            <Text style={[styles.tableHeaderText, styles.colUnitPrice]}>
              Prix unitaire
            </Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>

          {/* Lignes du tableau */}
          {quote.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                ...(index % 2 === 1 ? [styles.tableRowEven] : []),
              ]}
            >
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQuantity}>{item.quantity}</Text>
              <Text style={styles.colUnitPrice}>
                {formatCurrencyLocal(item.unitPrice)}
              </Text>
              <Text style={styles.colTotal}>
                {formatCurrencyLocal(item.totalPrice)}
              </Text>
            </View>
          ))}
        </View>

        {/* Section totaux */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text>Sous-total HT :</Text>
              <Text>{formatCurrencyLocal(quote.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>TVA ({quote.vatRate}%) :</Text>
              <Text>{formatCurrencyLocal(quote.vatAmount)}</Text>
            </View>
            <View style={styles.totalRowFinal}>
              <Text>TOTAL TTC :</Text>
              <Text>{formatCurrencyLocal(quote.totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Notes (si présentes) */}
        {quote.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes :</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{quote.notes}</Text>
            </View>
          </View>
        )}

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text style={styles.footerHighlight}>
            Merci pour votre confiance !
          </Text>
          <Text style={styles.footerText}>
            Ce devis est valable 30 jours à compter de sa date d'émission.
          </Text>
          <Text style={styles.footerText}>
            Conditions de paiement : 30% à la commande, 70% à la livraison
          </Text>
          <Text style={styles.footerText}>
            En cas de questions, n'hésitez pas à me contacter.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
