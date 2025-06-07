// components/dashboard/quotes/professional-quote-pdf.tsx
"use client";

import { Quote } from "@/types/QuoteTypes";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";

// Styles professionnels optimisés
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 0,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
  },

  // En-tête moderne avec gradient simulé
  headerSection: {
    backgroundColor: "#1a1a2e",
    padding: 30,
    marginBottom: 0,
  },

  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  companyInfo: {
    flex: 1,
  },

  companyName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: 1,
  },

  companySubtitle: {
    fontSize: 14,
    color: "#7158ff",
    marginBottom: 12,
    fontWeight: "bold",
  },

  companyDetails: {
    fontSize: 11,
    color: "#E2E8F0",
    lineHeight: 1.6,
  },

  companyDetailLine: {
    marginBottom: 2,
  },

  // Section devis en haut à droite
  quoteHeaderBox: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 8,
    minWidth: 200,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },

  quoteTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#7158ff",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 2,
  },

  quoteNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a2e",
    textAlign: "center",
    marginBottom: 8,
  },

  quoteDates: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 1.4,
  },

  // Section principale du contenu
  mainContent: {
    padding: 30,
    flex: 1,
  },

  // Informations client stylées
  clientSection: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: "#7158ff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  clientCard: {
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#7158ff",
  },

  clientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 8,
  },

  clientDetails: {
    fontSize: 11,
    color: "#4A5568",
    lineHeight: 1.6,
  },

  clientType: {
    fontSize: 10,
    backgroundColor: "#7158ff",
    color: "#FFFFFF",
    padding: "4 8",
    borderRadius: 4,
    marginTop: 8,
    alignSelf: "flex-start",
  },

  // Tableau moderne
  tableSection: {
    marginBottom: 25,
  },

  tableContainer: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    overflow: "hidden",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
    padding: 15,
  },

  tableHeaderText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  tableRow: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    minHeight: 45,
    alignItems: "center",
  },

  tableRowAlt: {
    backgroundColor: "#F8FAFC",
  },

  tableRowLast: {
    borderBottomWidth: 0,
  },

  // Colonnes avec meilleure répartition
  colDescription: {
    width: "45%",
    paddingRight: 10,
  },

  colQuantity: {
    width: "12%",
    textAlign: "center",
  },

  colUnitPrice: {
    width: "21%",
    textAlign: "right",
  },

  colTotal: {
    width: "22%",
    textAlign: "right",
    fontWeight: "bold",
  },

  itemDescription: {
    fontSize: 11,
    color: "#2D3748",
    fontWeight: "500",
  },

  itemQuantity: {
    fontSize: 11,
    color: "#4A5568",
    backgroundColor: "#EDF2F7",
    padding: "4 8",
    borderRadius: 4,
    textAlign: "center",
  },

  itemPrice: {
    fontSize: 11,
    color: "#4A5568",
  },

  itemTotal: {
    fontSize: 12,
    color: "#1a1a2e",
    fontWeight: "bold",
  },

  // Section totaux redesignée
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 25,
  },

  totalsContainer: {
    width: 320,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    fontSize: 12,
    color: "#4A5568",
  },

  totalLineSubtotal: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginBottom: 8,
  },

  totalLineFinal: {
    backgroundColor: "#1a1a2e",
    marginHorizontal: -20,
    marginBottom: -20,
    padding: 20,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },

  totalFinalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  totalFinalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7158ff",
  },

  // Notes stylées
  notesSection: {
    marginBottom: 25,
  },

  notesContainer: {
    backgroundColor: "#FEF3C7",
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },

  notesTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 8,
    textTransform: "uppercase",
  },

  notesText: {
    fontSize: 11,
    color: "#92400E",
    lineHeight: 1.6,
    fontStyle: "italic",
  },

  // Pied de page professionnel
  footer: {
    backgroundColor: "#F8FAFC",
    padding: 25,
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  footerContent: {
    textAlign: "center",
  },

  footerThankYou: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7158ff",
    marginBottom: 12,
  },

  footerText: {
    fontSize: 10,
    color: "#6B7280",
    lineHeight: 1.6,
    marginBottom: 4,
  },

  footerImportant: {
    fontSize: 11,
    color: "#1a1a2e",
    fontWeight: "bold",
    marginTop: 8,
  },

  // Éléments décoratifs
  decorativeLine: {
    height: 3,
    backgroundColor: "#7158ff",
    marginVertical: 15,
    borderRadius: 2,
  },

  badge: {
    backgroundColor: "#10B981",
    color: "#FFFFFF",
    fontSize: 9,
    padding: "3 8",
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 5,
  },
});

// Types
interface ProfessionalQuotePDFProps {
  quote: Quote;
}

// Fonctions utilitaires améliorées
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
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

// Composant principal PDF professionnel
export const ProfessionalQuotePDF: React.FC<ProfessionalQuotePDFProps> = ({
  quote,
}) => {
  return (
    <Document
      title={`Devis ${quote.quoteNumber} - Gaël Richard`}
      author="Gaël Richard - Développeur Freelance"
      subject={`Devis professionnel pour ${quote.client.firstName} ${quote.client.lastName}`}
      creator="Application de gestion - Gaël Richard"
      keywords="devis, développement, freelance, web"
    >
      <Page size="A4" style={styles.page}>
        {/* En-tête moderne */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>Gaël Richard</Text>
              <Text style={styles.companySubtitle}>Développeur Freelance</Text>

              <View style={styles.companyDetails}>
                <Text style={styles.companyDetailLine}>
                  7 rue du pré de la ramée
                </Text>
                <Text style={styles.companyDetailLine}>
                  44550 Montoir De Bretagne
                </Text>
                <Text style={styles.companyDetailLine}>
                  SIRET: 93044860000013
                </Text>
                <Text style={styles.companyDetailLine}>📧 gael_pro@ik.me</Text>
                <Text style={styles.companyDetailLine}>
                  📱 +33 6 33 36 40 94
                </Text>
              </View>
            </View>

            <View style={styles.quoteHeaderBox}>
              <Text style={styles.quoteTitle}>DEVIS</Text>
              <Text style={styles.quoteNumber}>{quote.quoteNumber}</Text>
              <View style={styles.quoteDates}>
                <Text>Date: {formatDateShort(quote.createdAt)}</Text>
                <Text>
                  Valide jusqu'au: {formatDateShort(quote.validUntil)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contenu principal */}
        <View style={styles.mainContent}>
          {/* Informations client */}
          <View style={styles.clientSection}>
            <Text style={styles.sectionTitle}>Client</Text>
            <View style={styles.clientCard}>
              <Text style={styles.clientName}>
                {quote.client.firstName} {quote.client.lastName}
              </Text>
              <View style={styles.clientDetails}>
                <Text>📧 {quote.client.email}</Text>
                {quote.client.phone && <Text>📱 {quote.client.phone}</Text>}
                {quote.client.address && <Text>📍 {quote.client.address}</Text>}
              </View>
              <Text style={styles.clientType}>
                {quote.client.isProfessional
                  ? "💼 Professionnel"
                  : "👤 Particulier"}
              </Text>
            </View>
          </View>

          {/* Ligne décorative */}
          <View style={styles.decorativeLine} />

          {/* Tableau des prestations */}
          <View style={styles.tableSection}>
            <Text style={styles.sectionTitle}>Prestations</Text>

            <View style={styles.tableContainer}>
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
                <Text style={[styles.tableHeaderText, styles.colTotal]}>
                  Total HT
                </Text>
              </View>

              {/* Lignes du tableau */}
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
                    <Text style={styles.itemDescription}>
                      {item.description}
                    </Text>
                  </View>

                  <View style={styles.colQuantity}>
                    <Text style={styles.itemQuantity}>{item.quantity}</Text>
                  </View>

                  <Text style={[styles.itemPrice, styles.colUnitPrice]}>
                    {formatCurrencyLocal(item.unitPrice)}
                  </Text>

                  <Text style={[styles.itemTotal, styles.colTotal]}>
                    {formatCurrencyLocal(item.totalPrice)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Section totaux */}
          <View style={styles.totalsSection}>
            <View style={styles.totalsContainer}>
              <View style={[styles.totalLine, styles.totalLineSubtotal]}>
                <Text>Sous-total HT</Text>
                <Text>{formatCurrencyLocal(quote.subtotal)}</Text>
              </View>

              <View style={styles.totalLine}>
                <Text>TVA ({quote.vatRate}%)</Text>
                <Text>{formatCurrencyLocal(quote.vatAmount)}</Text>
              </View>

              <View style={styles.totalLineFinal}>
                <View style={styles.totalLine}>
                  <Text style={styles.totalFinalText}>TOTAL TTC</Text>
                  <Text style={styles.totalFinalAmount}>
                    {formatCurrencyLocal(quote.totalAmount)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Notes si présentes */}
          {quote.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Notes importantes</Text>
              <View style={styles.notesContainer}>
                <Text style={styles.notesTitle}>⚠️ À noter</Text>
                <Text style={styles.notesText}>{quote.notes}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Pied de page professionnel */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.footerThankYou}>
              ✨ Merci pour votre confiance ! ✨
            </Text>

            <Text style={styles.footerText}>
              Ce devis est valable 30 jours à compter de sa date d'émission
            </Text>

            <Text style={styles.footerText}>
              Conditions de paiement : 30% à la commande • 70% à la livraison
            </Text>

            <Text style={styles.footerText}>
              Délai de rétractation : 14 jours (conformément au Code de la
              consommation)
            </Text>

            <Text style={styles.footerImportant}>
              Des questions ? Contactez-moi sans hésiter !
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
