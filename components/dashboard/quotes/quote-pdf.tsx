// components/pdf/quote-pdf.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Styles PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#7158ff",
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7158ff",
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 1.4,
  },
  quoteInfo: {
    alignItems: "flex-end",
  },
  quoteTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#7158ff",
    marginBottom: 10,
  },
  quoteNumber: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  quoteDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  clientSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7158ff",
    marginBottom: 15,
  },
  clientInfo: {
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 8,
  },
  clientName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  clientDetails: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 1.4,
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#7158ff",
    padding: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  tableRow: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  colDescription: {
    width: "50%",
    paddingRight: 10,
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
    width: "15%",
    textAlign: "right",
  },
  totalsSection: {
    alignItems: "flex-end",
    marginBottom: 30,
  },
  totalsTable: {
    width: 250,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  totalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#7158ff",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 5,
  },
  notesSection: {
    marginBottom: 30,
  },
  notesContent: {
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 8,
    fontSize: 11,
    lineHeight: 1.4,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 1.4,
  },
});

// Types
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

interface QuotePDFProps {
  quote: QuoteData;
}

// Fonction utilitaire pour formater la monnaie
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

// Fonction utilitaire pour formater les dates
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

// Composant PDF
export const QuotePDF = ({ quote }: QuotePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.companyInfo}>
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

        <View style={styles.quoteInfo}>
          <Text style={styles.quoteTitle}>DEVIS</Text>
          <Text style={styles.quoteNumber}>N° {quote.quoteNumber}</Text>
          <Text style={styles.quoteDate}>
            Date: {formatDate(quote.createdAt)}
          </Text>
          <Text style={styles.quoteDate}>
            Valide jusqu'au: {formatDate(quote.validUntil)}
          </Text>
        </View>
      </View>

      {/* Informations client */}
      <View style={styles.clientSection}>
        <Text style={styles.sectionTitle}>Facturé à:</Text>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>
            {quote.client.firstName} {quote.client.lastName}
          </Text>
          <View style={styles.clientDetails}>
            <Text>{quote.client.email}</Text>
            {quote.client.phone && <Text>{quote.client.phone}</Text>}
            {quote.client.address && <Text>{quote.client.address}</Text>}
            <Text>
              {quote.client.isProfessional
                ? "Client professionnel"
                : "Particulier"}
            </Text>
          </View>
        </View>
      </View>

      {/* Tableau des prestations */}
      <View style={styles.table}>
        <Text style={styles.sectionTitle}>Prestations:</Text>

        {/* En-tête du tableau */}
        <View style={styles.tableHeader}>
          <Text style={styles.colDescription}>Description</Text>
          <Text style={styles.colQuantity}>Quantité</Text>
          <Text style={styles.colUnitPrice}>Prix unitaire</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>

        {/* Lignes du tableau */}
        {quote.items.map((item, index) => (
          <View
            key={item.id}
            style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
          >
            <Text style={styles.colDescription}>{item.description}</Text>
            <Text style={styles.colQuantity}>{item.quantity}</Text>
            <Text style={styles.colUnitPrice}>
              {formatCurrency(item.unitPrice)}
            </Text>
            <Text style={styles.colTotal}>
              {formatCurrency(item.totalPrice)}
            </Text>
          </View>
        ))}
      </View>

      {/* Totaux */}
      <View style={styles.totalsSection}>
        <View style={styles.totalsTable}>
          <View style={styles.totalRow}>
            <Text>Sous-total HT:</Text>
            <Text>{formatCurrency(quote.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>TVA ({quote.vatRate}%):</Text>
            <Text>{formatCurrency(quote.vatAmount)}</Text>
          </View>
          <View style={styles.totalFinal}>
            <Text>Total TTC:</Text>
            <Text>{formatCurrency(quote.totalAmount)}</Text>
          </View>
        </View>
      </View>

      {/* Notes */}
      {quote.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notes:</Text>
          <View style={styles.notesContent}>
            <Text>{quote.notes}</Text>
          </View>
        </View>
      )}

      {/* Pied de page */}
      <View style={styles.footer}>
        <Text>Merci pour votre confiance !</Text>
        <Text>
          Ce devis est valable 30 jours à compter de sa date d'émission.
        </Text>
        <Text>
          Conditions de paiement : 30% à la commande, 70% à la livraison
        </Text>
      </View>
    </Page>
  </Document>
);
