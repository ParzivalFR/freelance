import jsPDF from 'jspdf';
import { PDF_LOGO_PNG } from './pdf-logo';

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

export interface DevisPDFRequest {
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

// Charte du site : perle, encre, kaki.
const INK = [30, 31, 36] as const;
const GREY = [105, 106, 112] as const;
const LINE = [227, 226, 222] as const;
const PEBBLE = [236, 235, 231] as const;
const KAKI = [74, 90, 58] as const;
const KAKI_LIGHT = [218, 223, 207] as const;
const WHITE = [255, 255, 255] as const;

const MARGIN = 16;

// Helvetica n'a pas l'espace fine insécable qu'Intl insère dans « 1 325,00 € »
const euros = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
    .format(n)
    .replace(/[  ]/g, ' ');

export function generateDevisPDF(data: DevisPDFRequest): Buffer {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.width;
  const pageH = doc.internal.pageSize.height;
  const contentW = pageW - 2 * MARGIN;
  const right = pageW - MARGIN;

  const textRight = (text: string, x: number, y: number) =>
    doc.text(text, x - doc.getTextWidth(text), y);

  // Petite étiquette façon « // … », comme sur le site
  const note = (text: string, x: number, y: number, alignRight = false) => {
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    const label = `// ${text}`;
    const w = doc.getTextWidth(label) + 5;
    const bx = alignRight ? x - w : x;
    doc.setFillColor(...KAKI_LIGHT);
    doc.roundedRect(bx, y - 4, w, 6, 1.5, 1.5, 'F');
    doc.setTextColor(...KAKI);
    doc.text(label, bx + 2.5, y);
    doc.setFont('helvetica', 'normal');
  };

  const footer = () => {
    const y = pageH - 12;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y - 5, right, y - 5);
    doc.setTextColor(...GREY);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${data.companyInfo.name} · SIRET ${data.companyInfo.siret} · ${data.companyInfo.email}`,
      MARGIN,
      y,
    );
    textRight(`Devis ${data.devisNumber} · page ${doc.getNumberOfPages()}`, right, y);
  };

  const tableHeader = (y: number) => {
    doc.setFillColor(...INK);
    doc.roundedRect(MARGIN, y, contentW, 8, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', MARGIN + 4, y + 5.3);
    textRight('QTÉ', MARGIN + 118, y + 5.3);
    textRight('PRIX UNITAIRE', MARGIN + 150, y + 5.3);
    textRight('TOTAL', right - 4, y + 5.3);
    return y + 8;
  };

  // ── En-tête : logo, nom, « DEVIS » ──
  let y = 18;
  doc.addImage(PDF_LOGO_PNG, 'PNG', MARGIN, y - 4, 13, 13);
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(data.companyInfo.name, MARGIN + 17, y + 2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  doc.text('développeur freelance', MARGIN + 17, y + 7);

  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  textRight('DEVIS', right, y + 4);
  note(`n° ${data.devisNumber} · ${data.date}`, right, y + 12, true);

  y += 22;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, right, y);
  y += 12;

  // ── Émetteur / destinataire ──
  const colRight = pageW / 2 + 6;
  const block = (title: string, x: number, lines: Array<string | undefined>) => {
    let yy = y;
    doc.setTextColor(...KAKI);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(title, x, yy);
    yy += 6;
    doc.setTextColor(...INK);
    doc.setFontSize(9.5);
    lines
      .filter((l): l is string => !!l && l.trim() !== '')
      .forEach((line, i) => {
        doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
        if (i > 0) doc.setTextColor(...GREY);
        line.split('\n').forEach((part) => {
          doc.text(part.trim(), x, yy);
          yy += 4.6;
        });
      });
    return yy;
  };
  const yLeft = block('ÉMETTEUR', MARGIN, [
    data.companyInfo.name,
    data.companyInfo.address,
    data.companyInfo.phone,
    data.companyInfo.email,
    `SIRET ${data.companyInfo.siret}`,
  ]);
  const yRight = block('DESTINATAIRE', colRight, [
    `${data.client.firstName} ${data.client.lastName}`,
    data.client.company,
    data.client.address,
    data.client.email,
    data.client.phone,
  ]);
  y = Math.max(yLeft, yRight) + 8;

  // ── Validité et conditions ──
  doc.setFillColor(...PEBBLE);
  doc.roundedRect(MARGIN, y, contentW, 14, 3, 3, 'F');
  const cell = (label: string, value: string, x: number) => {
    doc.setTextColor(...GREY);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(label.toUpperCase(), x, y + 5.2);
    doc.setTextColor(...INK);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x, y + 10.4);
  };
  cell("Valable jusqu'au", data.validUntil, MARGIN + 5);
  cell('Règlement', '30 jours net', MARGIN + 5 + contentW / 3);
  cell('TVA', data.tvaApplicable ? `${data.tvaRate} %` : 'non applicable (art. 293 B du CGI)', MARGIN + 5 + (2 * contentW) / 3);
  y += 24;

  // ── Lignes ──
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Détail des prestations', MARGIN, y);
  y += 6;
  y = tableHeader(y);

  data.items.forEach((item) => {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    const lines: string[] = doc.splitTextToSize(item.description, 96);
    const rowH = Math.max(10, lines.length * 4.6 + 5);

    if (y + rowH > pageH - 60) {
      footer();
      doc.addPage();
      y = 18;
      y = tableHeader(y);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
    }

    doc.setTextColor(...INK);
    doc.text(lines, MARGIN + 4, y + 6.5);
    const mid = y + 6.5;
    doc.setTextColor(...GREY);
    textRight(String(item.quantity), MARGIN + 118, mid);
    textRight(euros(item.unitPrice), MARGIN + 150, mid);
    doc.setTextColor(...INK);
    doc.setFont('helvetica', 'bold');
    textRight(euros(item.total), right - 4, mid);
    doc.setFont('helvetica', 'normal');

    y += rowH;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, y, right, y);
  });

  // ── Totaux ──
  if (y + 48 > pageH - 30) {
    footer();
    doc.addPage();
    y = 18;
  }
  y += 10;
  const boxW = 78;
  const boxX = right - boxW;
  const totalRows: Array<[string, string]> = [['Sous-total HT', euros(data.subtotal)]];
  if (data.tvaApplicable) totalRows.push([`TVA ${data.tvaRate} %`, euros(data.tvaAmount)]);
  const boxH = 10 + totalRows.length * 7 + 14;
  doc.setFillColor(...PEBBLE);
  doc.roundedRect(boxX, y, boxW, boxH, 3, 3, 'F');
  let ty = y + 8;
  doc.setFontSize(9);
  totalRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GREY);
    doc.text(label, boxX + 6, ty);
    doc.setTextColor(...INK);
    textRight(value, right - 6, ty);
    ty += 7;
  });
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.4);
  doc.line(boxX + 6, ty - 3, right - 6, ty - 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(data.tvaApplicable ? 'Total TTC' : 'Total HT', boxX + 6, ty + 5);
  doc.setFontSize(14);
  textRight(euros(data.total), right - 6, ty + 5);
  y += boxH + 12;

  // ── Notes ──
  if (data.notes) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const lines: string[] = doc.splitTextToSize(data.notes, contentW - 12);
    const h = lines.length * 4.6 + 8;
    if (y + h > pageH - 30) {
      footer();
      doc.addPage();
      y = 18;
    }
    doc.setTextColor(...KAKI);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('NOTES', MARGIN, y);
    y += 4;
    doc.setDrawColor(...KAKI_LIGHT);
    doc.setLineWidth(0.8);
    doc.line(MARGIN + 0.5, y, MARGIN + 0.5, y + h - 6);
    doc.setTextColor(...INK);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(lines, MARGIN + 6, y + 4);
    y += h;
  }

  // ── Bon pour accord ──
  if (y + 26 > pageH - 22) {
    footer();
    doc.addPage();
    y = 18;
  }
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y, contentW, 24, 3, 3, 'S');
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Bon pour accord', MARGIN + 6, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text('Date et signature, précédées de la mention « bon pour accord ».', MARGIN + 6, y + 14);
  note("réponse sous 24 h à toute question", right - 6, y + 9, true);

  footer();

  return Buffer.from(doc.output('arraybuffer'));
}
