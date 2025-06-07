// components/pdf/QuoteDocument.tsx
import { QuoteStatus } from "@prisma/client";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// Enregistrer les polices (optionnel)
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuBWYAZ9hiA.woff2",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2",
      fontWeight: 700,
    },
  ],
});

// Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Inter",
    fontSize: 10,
    lineHeight: 1.4,
  },

  // En-tête
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#7c3aed",
  },

  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  companyInfo: {
    flexDirection: "column",
    alignItems: "flex-start",
  },

  companyName: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: 4,
  },

  companyDetails: {
    fontSize: 9,
    color: "#6b7280",
    lineHeight: 1.3,
  },

  quoteNumber: {
    flexDirection: "column",
    alignItems: "flex-end",
  },

  quoteTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#7c3aed",
    marginBottom: 4,
  },

  quoteSubtitle: {
    fontSize: 11,
    color: "#6b7280",
  },

  // Informations client et devis
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  clientInfo: {
    flex: 1,
    marginRight: 20,
  },

  quoteInfo: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
  },

  infoLabel: {
    fontSize: 9,
    color: "#6b7280",
    width: 80,
  },

  infoValue: {
    fontSize: 9,
    color: "#1f2937",
    flex: 1,
    fontWeight: 500,
  },

  // Description
  description: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
  },

  descriptionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: 6,
  },

  descriptionText: {
    fontSize: 9,
    color: "#4b5563",
    lineHeight: 1.4,
  },

  // Tableau des prestations
  table: {
    marginBottom: 25,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#7c3aed",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  tableHeaderText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: 600,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  tableRowEven: {
    backgroundColor: "#f9fafb",
  },

  tableCellDescription: {
    flex: 3,
  },

  tableCellQuantity: {
    flex: 1,
    textAlign: "right",
  },

  tableCellPrice: {
    flex: 1,
    textAlign: "right",
  },

  tableCellTotal: {
    flex: 1,
    textAlign: "right",
  },

  itemTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: 2,
  },

  itemDescription: {
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.3,
  },

  // Totaux
  totalsSection: {
    alignItems: "flex-end",
    marginBottom: 30,
  },

  totalsContainer: {
    width: 200,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 12,
  },

  totalRowFinal: {
    backgroundColor: "#7c3aed",
    borderRadius: 4,
    marginTop: 6,
  },

  totalLabel: {
    fontSize: 9,
    color: "#6b7280",
  },

  totalLabelFinal: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: 600,
  },

  totalValue: {
    fontSize: 9,
    fontWeight: 600,
    color: "#1f2937",
  },

  totalValueFinal: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: 700,
  },

  // Conditions
  conditionsSection: {
    marginTop: 20,
  },

  conditionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  conditionsColumn: {
    flex: 1,
    marginRight: 15,
  },

  conditionsTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: 6,
  },

  conditionsText: {
    fontSize: 8,
    color: "#4b5563",
    lineHeight: 1.4,
  },

  // Notes
  notesSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },

  notesTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: "#92400e",
    marginBottom: 4,
  },

  notesText: {
    fontSize: 8,
    color: "#92400e",
    lineHeight: 1.4,
  },

  // Pied de page
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  footerText: {
    fontSize: 8,
    color: "#6b7280",
  },

  // Badge de statut
  statusBadge: {
    position: "absolute",
    top: 50,
    right: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#10b981",
  },

  statusText: {
    fontSize: 8,
    color: "#ffffff",
    fontWeight: 600,
    textTransform: "uppercase",
  },
});

interface QuoteData {
  id: string;
  number: string;
  title: string;
  description?: string | null;
  status: QuoteStatus;
  subtotalHT: number;
  taxRate: number;
  taxAmount: number;
  totalTTC: number;
  validUntil: Date | null;
  createdAt: Date;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  notes?: string | null;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    isProfessional: boolean;
  };
  items: Array<{
    title: string;
    description?: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit: string;
  }>;
}

interface QuoteDocumentProps {
  quote: QuoteData;
}

const statusLabels = {
  [QuoteStatus.DRAFT]: "Brouillon",
  [QuoteStatus.SENT]: "Envoyé",
  [QuoteStatus.ACCEPTED]: "Accepté",
  [QuoteStatus.REJECTED]: "Refusé",
  [QuoteStatus.EXPIRED]: "Expiré",
  [QuoteStatus.CANCELLED]: "Annulé",
};

const statusColors = {
  [QuoteStatus.DRAFT]: "#6b7280",
  [QuoteStatus.SENT]: "#3b82f6",
  [QuoteStatus.ACCEPTED]: "#10b981",
  [QuoteStatus.REJECTED]: "#ef4444",
  [QuoteStatus.EXPIRED]: "#f59e0b",
  [QuoteStatus.CANCELLED]: "#6b7280",
};

export function QuoteDocument({ quote }: QuoteDocumentProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("fr-FR").format(new Date(date));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Badge de statut */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[quote.status] },
          ]}
        >
          <Text style={styles.statusText}>{statusLabels[quote.status]}</Text>
        </View>

        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Gaël Richard</Text>
            <Text style={styles.companyDetails}>
              Développeur Web Freelance{"\n"}7 rue du pré de la ramée{"\n"}
              44550 Montoir De Bretagne{"\n"}
              Tel: +33 6 33 36 40 94{"\n"}
              Email: gael_pro@ik.me{"\n"}
              SIRET: 93044860000013
            </Text>
          </View>

          <View style={styles.quoteNumber}>
            <Text style={styles.quoteTitle}>DEVIS</Text>
            <Text style={styles.quoteSubtitle}>{quote.number}</Text>
          </View>
        </View>

        {/* Informations */}
        <View style={styles.infoSection}>
          <View style={styles.clientInfo}>
            <Text style={styles.sectionTitle}>CLIENT</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nom :</Text>
              <Text style={styles.infoValue}>
                {quote.client.firstName} {quote.client.lastName}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email :</Text>
              <Text style={styles.infoValue}>{quote.client.email}</Text>
            </View>
            {quote.client.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Téléphone :</Text>
                <Text style={styles.infoValue}>{quote.client.phone}</Text>
              </View>
            )}
            {quote.client.address && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Adresse :</Text>
                <Text style={styles.infoValue}>{quote.client.address}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type :</Text>
              <Text style={styles.infoValue}>
                {quote.client.isProfessional ? "Professionnel" : "Particulier"}
              </Text>
            </View>
          </View>

          <View style={styles.quoteInfo}>
            <Text style={styles.sectionTitle}>DEVIS</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date :</Text>
              <Text style={styles.infoValue}>
                {formatDate(quote.createdAt)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Validité :</Text>
              <Text style={styles.infoValue}>
                {formatDate(quote.validUntil)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Objet :</Text>
              <Text style={styles.infoValue}>{quote.title}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {quote.description && (
          <View style={styles.description}>
            <Text style={styles.descriptionTitle}>Description du projet</Text>
            <Text style={styles.descriptionText}>{quote.description}</Text>
          </View>
        )}

        {/* Tableau des prestations */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableCellDescription]}>
              PRESTATIONS
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableCellQuantity]}>
              QTÉ
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableCellPrice]}>
              P.U. HT
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableCellTotal]}>
              TOTAL HT
            </Text>
          </View>

          {quote.items.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                ...(index % 2 === 1 ? [styles.tableRowEven] : []),
              ]}
            >
              <View style={styles.tableCellDescription}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                )}
              </View>
              <Text style={[styles.tableCellQuantity, { fontSize: 9 }]}>
                {item.quantity} {item.unit}
              </Text>
              <Text style={[styles.tableCellPrice, { fontSize: 9 }]}>
                {formatPrice(item.unitPrice)}
              </Text>
              <Text
                style={[
                  styles.tableCellTotal,
                  { fontSize: 9, fontWeight: 600 },
                ]}
              >
                {formatPrice(item.totalPrice)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total HT :</Text>
              <Text style={styles.totalValue}>
                {formatPrice(quote.subtotalHT)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA ({quote.taxRate}%) :</Text>
              <Text style={styles.totalValue}>
                {formatPrice(quote.taxAmount)}
              </Text>
            </View>
            <View style={[styles.totalRow, styles.totalRowFinal]}>
              <Text style={styles.totalLabelFinal}>TOTAL TTC :</Text>
              <Text style={styles.totalValueFinal}>
                {formatPrice(quote.totalTTC)}
              </Text>
            </View>
          </View>
        </View>

        {/* Conditions */}
        {(quote.paymentTerms || quote.deliveryTerms) && (
          <View style={styles.conditionsSection}>
            <View style={styles.conditionsGrid}>
              {quote.paymentTerms && (
                <View style={styles.conditionsColumn}>
                  <Text style={styles.conditionsTitle}>
                    Conditions de paiement
                  </Text>
                  <Text style={styles.conditionsText}>
                    {quote.paymentTerms}
                  </Text>
                </View>
              )}

              {quote.deliveryTerms && (
                <View style={styles.conditionsColumn}>
                  <Text style={styles.conditionsTitle}>
                    Conditions de livraison
                  </Text>
                  <Text style={styles.conditionsText}>
                    {quote.deliveryTerms}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Notes */}
        {quote.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes importantes</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Devis généré le {formatDate(new Date())}
          </Text>
          <Text style={styles.footerText}>Page 1 sur 1</Text>
        </View>
      </Page>
    </Document>
  );
}
