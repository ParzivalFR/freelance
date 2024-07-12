import {
  Document,
  Image,
  Link,
  Page as PDFPage,
  Text,
  View,
} from "@react-pdf/renderer";
import { PDFStyle } from "./style";

export default function PDFPageComponent() {
  const services = [
    {
      description: "Rédaction d'un rapport d'audit",
      details:
        "Rédaction d'un rapport d'audit (SEO) pour le site louiscmartin.martin.fr Prestation réalisée entre le 01/01/2021 et le 18/02/2021 à Paris, France.",
      quantity: 15,
      unit: "heure",
      price: 150,
      tva: 20,
      total: 1200,
    },
    {
      description: "Rédaction d'un rapport d'audit",
      details:
        "Rédaction d'un rapport d'audit (SEO) pour le site louiscmartin.martin.fr Prestation réalisée entre le 01/01/2021 et le 18/02/2021 à Paris, France.",
      quantity: 15,
      unit: "heure",
      price: 150,
      tva: 20,
      total: 1200,
    },
  ];

  const subTotal = services.reduce(
    (sum, service) => sum + service.price * service.quantity,
    0
  );
  const tva = subTotal * 0.2;
  const total = subTotal + tva;

  return (
    <Document>
      <PDFPage size="A4" style={PDFStyle.page}>
        {/* En-tête */}
        <View style={PDFStyle.header}>
          <Image src="/logo.png" style={PDFStyle.logo} />
          <View style={PDFStyle.companyDetails}>
            <Text style={PDFStyle.infoText}>Gael RICHARD</Text>
            <Text style={PDFStyle.companyAdress}>
              7 rue du pré de la ramée,
            </Text>
            <Text style={PDFStyle.infoText}>44550 Montoir De Bretagne</Text>

            <Text style={PDFStyle.infoText}>N° SIRET : 987654321</Text>
            <Text style={PDFStyle.infoText}>N° SIREN : 987654321</Text>
            <Text style={PDFStyle.infoText}>E-mail: exemple@email.fr</Text>
            <Text style={PDFStyle.infoText}>Téléphone: 03 86 86 86 86</Text>
            <Text style={PDFStyle.infoText}>
              Site:{" "}
              <Link style={PDFStyle.link} href="https://www.gael-dev.fr">
                https://www.gael-dev.fr
              </Link>
            </Text>
          </View>
        </View>

        {/* Informations */}
        <View style={PDFStyle.infoContainer}>
          <View style={PDFStyle.clientInfo}>
            <Text style={PDFStyle.sectionTitle}>Destinataire :</Text>
            <Text>Louis Martin</Text>
            <Text>45, Avenue du Président Jefferson 75029 Paris</Text>
            <Text>France</Text>
          </View>
          <View style={PDFStyle.invoiceInfo}>
            <Text style={PDFStyle.sectionTitle}>Facture :</Text>
            <Text>Numéro : 9</Text>
            <Text>Date de facture : 18/02/2021</Text>
            <Text>Date d'échéance : 26/02/2021</Text>
          </View>
        </View>

        {/* Détails du service */}
        <View>
          <View style={PDFStyle.tableHeader}>
            <Text style={[PDFStyle.tableColDesc, { fontWeight: "heavy" }]}>
              Description
            </Text>
            <Text style={[PDFStyle.tableCol, { fontWeight: "heavy" }]}>
              Quantité
            </Text>
            <Text style={[PDFStyle.tableCol, { fontWeight: "heavy" }]}>
              Unité
            </Text>
            <Text style={[PDFStyle.tableCol, { fontWeight: "heavy" }]}>
              Prix
            </Text>
            <Text style={[PDFStyle.tableCol, { fontWeight: "heavy" }]}>
              TVA
            </Text>
            <Text style={[PDFStyle.tableCol, { fontWeight: "heavy" }]}>
              Montant
            </Text>
          </View>
          {services.map((service, index) => (
            <View
              key={index}
              style={[PDFStyle.tableRow, { margin: 0, padding: 2 }]}
            >
              <Text style={[PDFStyle.tableColDesc, PDFStyle.tableBackground]}>
                - {service.description}
              </Text>
              <Text style={[PDFStyle.tableCol, PDFStyle.tableBackground]}>
                {service.quantity}
              </Text>
              <Text style={[PDFStyle.tableCol, PDFStyle.tableBackground]}>
                {service.unit}
              </Text>
              <Text style={[PDFStyle.tableCol, PDFStyle.tableBackground]}>
                {service.price.toFixed(0)}
              </Text>
              <Text style={[PDFStyle.tableCol, PDFStyle.tableBackground]}>
                {service.tva}%
              </Text>
              <Text style={[PDFStyle.tableCol, PDFStyle.tableBackground]}>
                {service.total.toFixed(0)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={PDFStyle.infoContainer}>
          <View style={{ width: "60%" }} />
          <View style={[PDFStyle.invoiceInfo, { width: "40%" }]}>
            <View
              style={[
                PDFStyle.tableRow,
                { margin: 0, padding: 2, justifyContent: "space-between" },
              ]}
            >
              <Text style={PDFStyle.tableColDesc}>Sous-total HT</Text>
              <Text style={PDFStyle.tableCol}>{subTotal.toFixed(0)}</Text>
            </View>
            <View
              style={[
                PDFStyle.tableRow,
                { margin: 0, padding: 2, justifyContent: "space-between" },
              ]}
            >
              <Text style={PDFStyle.tableColDesc}>TVA 20%</Text>
              <Text style={PDFStyle.tableCol}>{tva.toFixed(0)}</Text>
            </View>
            <View
              style={[
                PDFStyle.tableRow,
                { margin: 0, padding: 2, justifyContent: "space-between" },
              ]}
            >
              <Text style={PDFStyle.tableColDesc}>Montant Total</Text>
              <Text style={PDFStyle.tableCol}>{total.toFixed(0)}</Text>
            </View>
            <View
              style={[
                PDFStyle.tableRow,
                { margin: 0, padding: 2, justifyContent: "space-between" },
              ]}
            >
              <Text style={PDFStyle.tableColDesc}>Montant payé</Text>
              <Text style={PDFStyle.tableCol}>0.00</Text>
            </View>
            <View
              style={[
                PDFStyle.tableRow,
                { margin: 0, padding: 2, justifyContent: "space-between" },
              ]}
            >
              <Text style={PDFStyle.tableColDesc}>Montant à payer (EUR)</Text>
              <Text style={PDFStyle.tableCol}>{total.toFixed(0)}</Text>
            </View>
          </View>
        </View>

        {/* Conditions générales */}
        <View style={PDFStyle.footer}>
          <Text style={PDFStyle.footerText}>
            Conditions générales: La facture doit être payée dans un délai de 30
            jours après sa date d'émission. En cas de retard de paiement, les
            pénalités de retard s'élèvent à 10% du montant total de la facture.
            L'indemnité forfaitaire pour frais de recouvrement est de 40 euros.
          </Text>
        </View>

        {/* QR Code et lien de paiement */}
        <View style={PDFStyle.qrCode}>
          <Image src="/qrcode.png" style={PDFStyle.qrImage} />
          <View style={PDFStyle.qrContent}>
            <Text>
              Numéro SIREN : 987654321 - Numéro SIRET : 987654321 - Code APE :
              6201Z
            </Text>
          </View>
        </View>
      </PDFPage>
    </Document>
  );
}
