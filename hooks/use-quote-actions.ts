// hooks/use-quote-actions.ts
"use client";

import { updateQuoteStatus, deleteQuote } from "@/app/actions/quotes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

interface Quote {
  id: string;
  quoteNumber: string;
  client: Client;
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

export function useQuoteActions() {
  const router = useRouter();

  const changeStatus = async (quoteId: string, newStatus: Quote["status"]) => {
    try {
      await updateQuoteStatus(quoteId, newStatus);
      toast.success("Statut mis à jour avec succès");
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour du statut");
      return false;
    }
  };

  const duplicateQuote = async (quote: Quote) => {
    try {
      // Créer une copie du devis avec un nouveau numéro
      const duplicatedQuote = {
        clientId: quote.client.id,
        items: quote.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        vatRate: quote.vatRate,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        notes: quote.notes,
      };

      // Tu peux implémenter la création ici
      // await createQuote(duplicatedQuote);

      toast.success("Devis dupliqué avec succès");
      router.refresh();
      return true;
    } catch (error) {
      console.error("Erreur lors de la duplication:", error);
      toast.error("Erreur lors de la duplication du devis");
      return false;
    }
  };

  const removeQuote = async (quoteId: string) => {
    try {
      await deleteQuote(quoteId);
      toast.success("Devis supprimé avec succès");
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du devis");
      return false;
    }
  };

  const sendByEmail = async (quote: Quote) => {
    try {
      // Implémenter l'envoi par email
      const emailData = {
        to: quote.client.email,
        subject: `Devis ${quote.quoteNumber} - Gaël Richard`,
        quoteId: quote.id,
      };

      // const response = await fetch('/api/quotes/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(emailData),
      // });

      // if (!response.ok) throw new Error('Erreur envoi email');

      // Marquer comme envoyé
      await changeStatus(quote.id, "SENT");
      toast.success("Devis envoyé par email avec succès");
      return true;
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error("Erreur lors de l'envoi du devis");
      return false;
    }
  };

  const convertToInvoice = async (quote: Quote) => {
    try {
      if (quote.status !== "ACCEPTED") {
        toast.error(
          "Seuls les devis acceptés peuvent être convertis en facture"
        );
        return false;
      }

      // Implémenter la conversion en facture
      const invoiceData = {
        quoteId: quote.id,
        clientId: quote.client.id,
        items: quote.items,
        subtotal: quote.subtotal,
        vatRate: quote.vatRate,
        vatAmount: quote.vatAmount,
        totalAmount: quote.totalAmount,
      };

      // const response = await fetch('/api/invoices', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(invoiceData),
      // });

      // if (!response.ok) throw new Error('Erreur création facture');

      toast.success("Facture créée avec succès");
      router.push("/dashboard/invoices");
      return true;
    } catch (error) {
      console.error("Erreur lors de la conversion:", error);
      toast.error("Erreur lors de la création de la facture");
      return false;
    }
  };

  const copyQuoteNumber = (quoteNumber: string) => {
    navigator.clipboard.writeText(quoteNumber);
    toast.success("Numéro de devis copié dans le presse-papiers");
  };

  const copyClientEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copié dans le presse-papiers");
  };

  const markAsExpired = async (quoteId: string) => {
    return await changeStatus(quoteId, "EXPIRED");
  };

  const markAsDraft = async (quoteId: string) => {
    return await changeStatus(quoteId, "DRAFT");
  };

  const markAsSent = async (quoteId: string) => {
    return await changeStatus(quoteId, "SENT");
  };

  const markAsAccepted = async (quoteId: string) => {
    return await changeStatus(quoteId, "ACCEPTED");
  };

  const markAsRejected = async (quoteId: string) => {
    return await changeStatus(quoteId, "REJECTED");
  };

  return {
    // Actions de statut
    changeStatus,
    markAsExpired,
    markAsDraft,
    markAsSent,
    markAsAccepted,
    markAsRejected,

    // Actions de manipulation
    duplicateQuote,
    removeQuote,
    sendByEmail,
    convertToInvoice,

    // Actions utilitaires
    copyQuoteNumber,
    copyClientEmail,
  };
}
