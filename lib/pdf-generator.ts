import jsPDF from 'jspdf';

interface DevisItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ClientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
}

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  siret: string;
}

interface DevisPDFRequest {
  devisNumber: string;
  date: string;
  validUntil: string;
  client: ClientInfo;
  items: DevisItem[];
  subtotal: number;
  tvaRate: number;
  tvaAmount: number;
  total: number;
  tvaApplicable: boolean;
  companyInfo: CompanyInfo;
  notes?: string;
}

export function generateDevisPDF(data: DevisPDFRequest): Buffer {
  const doc = new jsPDF();
  let yPos = 12;
  const margin = 10;
  const pageWidth = doc.internal.pageSize.width;
  
  // Palette sobre et moderne
  const charcoal = [45, 45, 45] as const;      // Gris très foncé pour les titres
  const darkGray = [75, 75, 75] as const;      // Gris foncé pour le texte principal
  const mediumGray = [120, 120, 120] as const; // Gris moyen pour les infos secondaires
  const lightGray = [240, 240, 240] as const;  // Gris très clair pour les fonds
  const accent = [90, 90, 90] as const;        // Accent discret
  
  // === HEADER MODERNE ET SOBRE ===
  // Titre DEVIS - sobre mais impactant
  doc.setTextColor(...charcoal);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text('DEVIS', margin, yPos);
  
  // Numéro en dessous, plus petit
  doc.setFontSize(9);
  doc.setTextColor(...mediumGray);
  doc.text(`N° ${data.devisNumber}`, margin, yPos + 5);
  
  // Nom entreprise à droite - style moderne
  doc.setTextColor(...charcoal);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const companyNameWidth = doc.getTextWidth(data.companyInfo.name);
  doc.text(data.companyInfo.name, pageWidth - margin - companyNameWidth, yPos);
  
  // Date sous le nom d'entreprise
  doc.setFontSize(8);
  doc.setTextColor(...mediumGray);
  const dateText = data.date;
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, pageWidth - margin - dateWidth, yPos + 5);
  
  yPos += 12;
  
  // Ligne de séparation subtile
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 10;
  
  // === INFORMATIONS EN COLONNES MODERNES ===
  const leftColX = margin;
  const rightColX = pageWidth / 2 + 10;
  
  // Section ÉMETTEUR
  doc.setTextColor(...accent);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('ÉMETTEUR', leftColX, yPos);
  
  doc.setTextColor(...darkGray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  yPos += 4;
  
  // Nom entreprise
  doc.setFont('helvetica', 'bold');
  doc.text(data.companyInfo.name, leftColX, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 3;
  
  // Adresse
  const addressLines = data.companyInfo.address.split('\n');
  addressLines.forEach(line => {
    doc.text(line.trim(), leftColX, yPos);
    yPos += 2.5;
  });
  
  doc.text(data.companyInfo.phone, leftColX, yPos);
  yPos += 2.5;
  doc.text(data.companyInfo.email, leftColX, yPos);
  yPos += 2.5;
  
  doc.setTextColor(...mediumGray);
  doc.setFontSize(7);
  doc.text(`SIRET ${data.companyInfo.siret}`, leftColX, yPos);
  
  // Section DESTINATAIRE (à droite)
  let clientY = yPos - (addressLines.length + 4) * 2.5 - 4;
  
  doc.setTextColor(...accent);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('DESTINATAIRE', rightColX, clientY);
  
  doc.setTextColor(...darkGray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  clientY += 4;
  
  // Nom client
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.client.firstName} ${data.client.lastName}`, rightColX, clientY);
  doc.setFont('helvetica', 'normal');
  clientY += 3;
  
  if (data.client.company) {
    doc.text(data.client.company, rightColX, clientY);
    clientY += 2.5;
  }
  
  if (data.client.address) {
    const clientAddressLines = data.client.address.split('\n');
    clientAddressLines.forEach(line => {
      doc.text(line.trim(), rightColX, clientY);
      clientY += 2.5;
    });
  }
  
  doc.text(data.client.email, rightColX, clientY);
  clientY += 2.5;
  
  if (data.client.phone) {
    doc.text(data.client.phone, rightColX, clientY);
  }
  
  yPos = Math.max(yPos, clientY) + 12;
  
  // === INFORMATIONS DU DEVIS - Card moderne ===
  const cardY = yPos;
  const cardHeight = 11;
  const cardWidth = 70;
  const cardX = pageWidth - margin - cardWidth;
  
  // Fond très subtil
  doc.setFillColor(...lightGray);
  doc.rect(cardX, cardY, cardWidth, cardHeight, 'F');
  
  // Bordure fine
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.rect(cardX, cardY, cardWidth, cardHeight, 'S');
  
  doc.setTextColor(...mediumGray);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('ÉCHÉANCE', cardX + 3, cardY + 4);
  doc.text('CONDITIONS', cardX + 3, cardY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkGray);
  doc.text(data.validUntil, cardX + 28, cardY + 4);
  doc.text('30 jours net', cardX + 28, cardY + 8);
  
  yPos += 18;
  
  // === TABLEAU MINIMALISTE ===
  doc.setTextColor(...charcoal);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Détail des prestations', margin, yPos);
  yPos += 8;
  
  // En-tête tableau - style très sobre
  const rowHeight = 7;
  const colWidths = [105, 18, 28, 30];
  let colX = margin;
  
  // Fond gris très clair pour l'en-tête
  doc.setFillColor(...lightGray);
  doc.rect(margin, yPos, pageWidth - 2 * margin, rowHeight, 'F');
  
  doc.setTextColor(...accent);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  
  doc.text('DESCRIPTION', colX + 2, yPos + 4);
  colX += colWidths[0];
  doc.text('QTÉ', colX + 2, yPos + 4);
  colX += colWidths[1];
  doc.text('PRIX UNIT.', colX + 2, yPos + 4);
  colX += colWidths[2];
  doc.text('TOTAL', colX + 2, yPos + 4);
  
  yPos += rowHeight;
  
  // Lignes du tableau
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  
  data.items.forEach((item, index) => {
    // Description avec gestion des lignes multiples
    const description = doc.splitTextToSize(item.description, colWidths[0] - 4);
    const itemHeight = Math.max(rowHeight, description.length * 2 + 1);
    
    // Vérifier si on a assez de place (incluant les totaux qui suivent)
    if (yPos + itemHeight + 35 > doc.internal.pageSize.height - 10) {
      doc.addPage();
      yPos = 12;
      
      // Réafficher l'en-tête du tableau sur la nouvelle page
      doc.setFillColor(...lightGray);
      doc.rect(margin, yPos, pageWidth - 2 * margin, rowHeight, 'F');
      
      doc.setTextColor(...accent);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      
      colX = margin;
      doc.text('DESCRIPTION', colX + 2, yPos + 4);
      colX += colWidths[0];
      doc.text('QTÉ', colX + 2, yPos + 4);
      colX += colWidths[1];
      doc.text('PRIX UNIT.', colX + 2, yPos + 4);
      colX += colWidths[2];
      doc.text('TOTAL', colX + 2, yPos + 4);
      
      yPos += rowHeight;
      
      // Remettre les styles pour les données
      doc.setTextColor(...darkGray);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
    }
    
    // Alternance très subtile
    if (index % 2 === 1) {
      doc.setFillColor(252, 252, 252);
      doc.rect(margin, yPos, pageWidth - 2 * margin, itemHeight, 'F');
    }
    
    colX = margin;
    
    // Description (peut être sur plusieurs lignes)
    doc.text(description, colX + 2, yPos + 4);
    colX += colWidths[0];
    
    // Centrer verticalement les autres colonnes si la description fait plusieurs lignes
    const verticalOffset = description.length > 1 ? Math.floor((itemHeight - 4) / 2) : 0;
    
    doc.text(item.quantity.toString(), colX + 2, yPos + 4 + verticalOffset);
    colX += colWidths[1];
    
    doc.text(`${item.unitPrice.toFixed(2)} €`, colX + 2, yPos + 4 + verticalOffset);
    colX += colWidths[2];
    
    doc.text(`${item.total.toFixed(2)} €`, colX + 2, yPos + 4 + verticalOffset);
    
    yPos += itemHeight;
  });
  
  // Ligne de fermeture très fine
  doc.setDrawColor(...mediumGray);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 25;
  
  // === TOTAUX ÉPURÉS ===
  const totalAreaX = pageWidth - margin - 75;
  
  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Sous-total
  doc.text('Sous-total HT', totalAreaX, yPos);
  const subtotalText = `${data.subtotal.toFixed(2)} €`;
  const subtotalWidth = doc.getTextWidth(subtotalText);
  doc.text(subtotalText, totalAreaX + 75 - subtotalWidth, yPos);
  yPos += 6;
  
  // TVA
  if (data.tvaApplicable) {
    doc.text(`TVA (${data.tvaRate}%)`, totalAreaX, yPos);
    const tvaText = `${data.tvaAmount.toFixed(2)} €`;
    const tvaWidth = doc.getTextWidth(tvaText);
    doc.text(tvaText, totalAreaX + 75 - tvaWidth, yPos);
    yPos += 6;
  }
  
  // Ligne fine
  doc.setDrawColor(...mediumGray);
  doc.setLineWidth(0.5);
  doc.line(totalAreaX, yPos + 2, totalAreaX + 70, yPos + 2);
  yPos += 10;
  
  // Total final - sobre mais visible
  doc.setTextColor(...charcoal);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  
  const totalLabel = data.tvaApplicable ? 'TOTAL TTC' : 'TOTAL HT';
  doc.text(totalLabel, totalAreaX, yPos);
  
  const totalText = `${data.total.toFixed(2)} €`;
  const totalWidth = doc.getTextWidth(totalText);
  doc.text(totalText, totalAreaX + 75 - totalWidth, yPos);
  
  yPos += 12;
  
  // === NOTES MODERNES ===
  if (data.notes) {
    // Vérifier s'il reste assez de place pour les notes
    if (yPos + 20 > doc.internal.pageSize.height - 15) {
      doc.addPage();
      yPos = 12;
    }
    
    doc.setTextColor(...charcoal);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', margin, yPos);
    yPos += 6;
    
    // Calculer la hauteur nécessaire pour les notes
    const notes = doc.splitTextToSize(data.notes, pageWidth - 2 * margin - 6);
    const notesHeight = Math.max(10, notes.length * 2.5 + 4);
    
    // Vérifier si les notes rentrent sur la page
    if (yPos + notesHeight > doc.internal.pageSize.height - 15) {
      doc.addPage();
      yPos = 12;
      
      doc.setTextColor(...charcoal);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', margin, yPos);
      yPos += 6;
    }
    
    // Zone de notes avec bordure fine
    doc.setFillColor(250, 250, 250);
    doc.rect(margin, yPos - 1, pageWidth - 2 * margin, notesHeight, 'F');
    
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    doc.rect(margin, yPos - 1, pageWidth - 2 * margin, notesHeight, 'S');
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    
    doc.text(notes, margin + 3, yPos + 2.5);
  }
  
  // === FOOTER DISCRET ===
  const footerY = doc.internal.pageSize.height - 8;
  
  doc.setTextColor(...mediumGray);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  
  const footerText = `Devis valable jusqu'au ${data.validUntil} • Règlement sous 30 jours ${
    data.tvaApplicable ? '• TVA applicable' : '• TVA non applicable'
  }`;
  
  const footerWidth = doc.getTextWidth(footerText);
  doc.text(footerText, (pageWidth - footerWidth) / 2, footerY);
  
  // Ligne décorative fine
  doc.setDrawColor(235, 235, 235);
  doc.setLineWidth(0.1);
  doc.line(margin + 25, footerY - 2, pageWidth - margin - 25, footerY - 2);
  
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}

export type { DevisPDFRequest, ClientInfo, DevisItem, CompanyInfo };