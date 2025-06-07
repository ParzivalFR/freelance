// types/quote-types.ts
export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt?: Date;
}

export interface QuoteClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  isProfessional: boolean;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  client: QuoteClient;
  items: QuoteItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  validUntil: Date;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type QuoteStatus = Quote["status"];

// Utilitaires pour les statuts
export const statusConfig: Record<
  QuoteStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    color: string;
  }
> = {
  DRAFT: { label: "Brouillon", variant: "secondary", color: "gray" },
  SENT: { label: "Envoyé", variant: "default", color: "blue" },
  ACCEPTED: { label: "Accepté", variant: "default", color: "green" },
  REJECTED: { label: "Refusé", variant: "destructive", color: "red" },
  EXPIRED: { label: "Expiré", variant: "outline", color: "orange" },
};

// Fonctions utilitaires
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

export const isExpired = (validUntil: Date): boolean => {
  return new Date() > new Date(validUntil);
};
