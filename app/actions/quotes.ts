// app/actions/quotes.ts - Ajout de fonction de sérialisation
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuoteStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// === FONCTION DE SÉRIALISATION ===
function serializeQuote(quote: any) {
  return {
    ...quote,
    subtotalHT: Number(quote.subtotalHT),
    taxRate: Number(quote.taxRate),
    taxAmount: Number(quote.taxAmount),
    totalTTC: Number(quote.totalTTC),
    items:
      quote.items?.map((item: any) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })) || [],
  };
}

// === SCHEMAS DE VALIDATION ===

const QuoteItemSchema = z.object({
  title: z.string().min(1, "Le titre est obligatoire").max(200),
  description: z.string().optional(),
  quantity: z.coerce.number().min(0.01, "La quantité doit être positive"),
  unitPrice: z.coerce.number().min(0, "Le prix unitaire doit être positif"),
  unit: z.string().min(1, "L'unité est obligatoire"),
  order: z.coerce.number().default(0),
});

const CreateQuoteSchema = z.object({
  clientId: z.string().min(1, "Le client est obligatoire"),
  title: z.string().min(1, "Le titre est obligatoire").max(200),
  description: z.string().optional(),
  validUntil: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  notes: z.string().optional(),
  taxRate: z.coerce.number().min(0).max(100).default(20),
  items: z.array(QuoteItemSchema).min(1, "Au moins un item est requis"),
});

const UpdateQuoteSchema = CreateQuoteSchema.partial().extend({
  id: z.string().min(1),
});

// === FONCTIONS UTILITAIRES ===

async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `DEV-${year}-`;

  // Trouver le dernier numéro de l'année
  const lastQuote = await prisma.quote.findFirst({
    where: {
      number: {
        startsWith: prefix,
      },
    },
    orderBy: {
      number: "desc",
    },
  });

  let nextNumber = 1;
  if (lastQuote) {
    const lastNumber = parseInt(lastQuote.number.split("-")[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(3, "0")}`;
}

function calculateQuoteTotals(items: any[], taxRate: number) {
  const subtotalHT = items.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice;
  }, 0);

  const taxAmount = (subtotalHT * taxRate) / 100;
  const totalTTC = subtotalHT + taxAmount;

  return {
    subtotalHT: Math.round(subtotalHT * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100,
  };
}

// === ACTIONS CRUD ===

export async function createQuote(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Session non trouvée");
    }

    // Récupération et parsing des données
    const rawData = {
      clientId: formData.get("clientId") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      validUntil: formData.get("validUntil") as string,
      paymentTerms: formData.get("paymentTerms") as string,
      deliveryTerms: formData.get("deliveryTerms") as string,
      notes: formData.get("notes") as string,
      taxRate: formData.get("taxRate") as string,
      items: JSON.parse((formData.get("items") as string) || "[]"),
    };

    // Validation
    const validatedFields = CreateQuoteSchema.safeParse(rawData);
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Champs invalides. Impossible de créer le devis.",
      };
    }

    const {
      clientId,
      title,
      description,
      validUntil,
      paymentTerms,
      deliveryTerms,
      notes,
      taxRate,
      items,
    } = validatedFields.data;

    // Vérifier que le client existe
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return {
        errors: { clientId: ["Client introuvable"] },
        message: "Client non trouvé.",
      };
    }

    // Calculer les totaux
    const totals = calculateQuoteTotals(items, taxRate);

    // Générer le numéro de devis
    const quoteNumber = await generateQuoteNumber();

    // Préparer la date de validité
    const validityDate = validUntil
      ? new Date(validUntil)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours par défaut

    // Créer le devis avec ses items
    const quote = await prisma.quote.create({
      data: {
        number: quoteNumber,
        title,
        description,
        clientId,
        validUntil: validityDate,
        paymentTerms,
        deliveryTerms,
        notes,
        taxRate,
        subtotalHT: totals.subtotalHT,
        taxAmount: totals.taxAmount,
        totalTTC: totals.totalTTC,
        items: {
          create: items.map((item, index) => ({
            title: item.title,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            unit: item.unit,
            order: index,
          })),
        },
      },
      include: {
        client: true,
        items: true,
      },
    });

    revalidatePath("/dashboard/quotes");
    return {
      message: `Devis ${quote.number} créé avec succès.`,
      quoteId: quote.id,
    };
  } catch (error) {
    console.error("Erreur lors de la création du devis:", error);
    return {
      message: "Erreur de base de données : Impossible de créer le devis.",
    };
  }
}

// === FONCTIONS DE LECTURE (avec sérialisation) ===

export async function getQuotes() {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Session non trouvée");
    }

    const quotes = await prisma.quote.findMany({
      include: {
        client: true,
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Sérialiser les quotes pour éviter les erreurs Decimal
    return quotes.map(serializeQuote);
  } catch (error) {
    console.error("Erreur lors de la récupération des devis:", error);
    throw new Error("Impossible de récupérer les devis");
  }
}

export async function getQuoteById(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Session non trouvée");
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!quote) return null;

    // Sérialiser le quote pour éviter les erreurs Decimal
    return serializeQuote(quote);
  } catch (error) {
    console.error("Erreur lors de la récupération du devis:", error);
    throw new Error("Impossible de récupérer le devis");
  }
}

export async function getQuotesByClientId(clientId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Session non trouvée");
    }

    const quotes = await prisma.quote.findMany({
      where: { clientId },
      include: {
        client: true,
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Sérialiser les quotes pour éviter les erreurs Decimal
    return quotes.map(serializeQuote);
  } catch (error) {
    console.error("Erreur lors de la récupération des devis client:", error);
    throw new Error("Impossible de récupérer les devis du client");
  }
}

// === ACTIONS DE STATUT ===

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Session non trouvée");
    }

    const updateData: any = { status };

    // Ajouter les dates selon le statut
    switch (status) {
      case QuoteStatus.SENT:
        updateData.sentAt = new Date();
        break;
      case QuoteStatus.ACCEPTED:
        updateData.acceptedAt = new Date();
        break;
      case QuoteStatus.REJECTED:
        updateData.rejectedAt = new Date();
        break;
    }

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: updateData,
      include: { client: true },
    });

    revalidatePath("/dashboard/quotes");
    revalidatePath(`/dashboard/quotes/${id}`);

    const statusLabels = {
      [QuoteStatus.DRAFT]: "brouillon",
      [QuoteStatus.SENT]: "envoyé",
      [QuoteStatus.ACCEPTED]: "accepté",
      [QuoteStatus.REJECTED]: "refusé",
      [QuoteStatus.EXPIRED]: "expiré",
      [QuoteStatus.CANCELLED]: "annulé",
    };

    return {
      message: `Devis ${updatedQuote.number} marqué comme ${statusLabels[status]}.`,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return {
      message: "Erreur lors de la mise à jour du statut.",
    };
  }
}

export async function deleteQuote(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Session non trouvée");
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
    });

    if (!quote) {
      return {
        message: "Devis non trouvé.",
      };
    }

    if (quote.status === QuoteStatus.ACCEPTED) {
      return {
        message: "Impossible de supprimer un devis accepté.",
      };
    }

    await prisma.quote.delete({
      where: { id },
    });

    revalidatePath("/dashboard/quotes");
    return { message: `Devis ${quote.number} supprimé avec succès.` };
  } catch (error) {
    console.error("Erreur lors de la suppression du devis:", error);
    return {
      message: "Erreur de base de données : Impossible de supprimer le devis.",
    };
  }
}

export async function duplicateQuote(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Session non trouvée");
    }

    const originalQuote = await prisma.quote.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!originalQuote) {
      return {
        message: "Devis non trouvé.",
      };
    }

    const newQuoteNumber = await generateQuoteNumber();
    const validityDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const duplicatedQuote = await prisma.quote.create({
      data: {
        number: newQuoteNumber,
        title: `${originalQuote.title} (Copie)`,
        description: originalQuote.description,
        clientId: originalQuote.clientId,
        validUntil: validityDate,
        paymentTerms: originalQuote.paymentTerms,
        deliveryTerms: originalQuote.deliveryTerms,
        notes: originalQuote.notes,
        taxRate: originalQuote.taxRate,
        subtotalHT: originalQuote.subtotalHT,
        taxAmount: originalQuote.taxAmount,
        totalTTC: originalQuote.totalTTC,
        status: QuoteStatus.DRAFT,
        items: {
          create: originalQuote.items.map((item) => ({
            title: item.title,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            unit: item.unit,
            order: item.order,
          })),
        },
      },
    });

    revalidatePath("/dashboard/quotes");
    return {
      message: `Devis ${duplicatedQuote.number} créé par duplication.`,
      quoteId: duplicatedQuote.id,
    };
  } catch (error) {
    console.error("Erreur lors de la duplication du devis:", error);
    return {
      message: "Erreur lors de la duplication du devis.",
    };
  }
}
