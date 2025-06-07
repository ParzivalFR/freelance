// app/actions/quotes.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schémas de validation
const QuoteItemSchema = z.object({
  description: z.string().min(1, "La description est obligatoire").max(200),
  quantity: z.number().min(1, "La quantité doit être d'au moins 1"),
  unitPrice: z.number().min(0, "Le prix unitaire doit être positif"),
});

const QuoteSchema = z.object({
  clientId: z.string().min(1, "Le client est obligatoire"),
  items: z.array(QuoteItemSchema).min(1, "Au moins un item est requis"),
  vatRate: z.number().min(0).max(100).default(20),
  validUntil: z.string().refine((date) => new Date(date) > new Date(), {
    message: "La date de validité doit être dans le futur",
  }),
  notes: z.string().optional(),
});

// Générer un numéro de devis unique
async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.quote.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });

  return `DEV-${year}-${String(count + 1).padStart(4, "0")}`;
}

// Créer un devis
export async function createQuote(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Session non trouvée");
    }

    // Récupération des données du formulaire
    const clientId = formData.get("clientId") as string;
    const vatRate = parseFloat(formData.get("vatRate") as string) || 20;
    const validUntil = formData.get("validUntil") as string;
    const notes = formData.get("notes") as string;

    // Récupération des items (JSON stringifié)
    const itemsJson = formData.get("items") as string;
    let items;
    try {
      items = JSON.parse(itemsJson);
    } catch {
      return {
        errors: { items: ["Format des items invalide"] },
        message: "Erreur de format des données",
      };
    }

    const rawFormData = {
      clientId,
      items,
      vatRate,
      validUntil,
      notes,
    };

    // Validation avec Zod
    const validatedFields = QuoteSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Champs invalides. Impossible de créer le devis.",
      };
    }

    // Calculs
    const subtotal = validatedFields.data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const vatAmount = (subtotal * validatedFields.data.vatRate) / 100;
    const totalAmount = subtotal + vatAmount;

    // Générer le numéro de devis
    const quoteNumber = await generateQuoteNumber();

    // Créer le devis avec les items
    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        clientId: validatedFields.data.clientId,
        subtotal,
        vatRate: validatedFields.data.vatRate,
        vatAmount,
        totalAmount,
        validUntil: new Date(validatedFields.data.validUntil),
        notes: validatedFields.data.notes,
        items: {
          create: validatedFields.data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        client: true,
        items: true,
      },
    });

    revalidatePath("/dashboard/quotes");
    return { message: "Devis créé avec succès.", quote };
  } catch (error) {
    console.error("Erreur lors de la création du devis:", error);
    return {
      message: "Erreur de base de données : Impossible de créer le devis.",
    };
  }
}

// Récupérer tous les devis
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

    return quotes;
  } catch (error) {
    console.error("Erreur lors de la récupération des devis:", error);
    throw new Error("Impossible de récupérer les devis");
  }
}

// Récupérer un devis par ID
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
        items: true,
      },
    });

    return quote;
  } catch (error) {
    console.error("Erreur lors de la récupération du devis:", error);
    throw new Error("Impossible de récupérer le devis");
  }
}

// Mettre à jour le statut d'un devis
export async function updateQuoteStatus(
  id: string,
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED"
) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Session non trouvée");
    }

    const quote = await prisma.quote.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        items: true,
      },
    });

    revalidatePath("/dashboard/quotes");
    return { message: "Statut du devis mis à jour avec succès.", quote };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    throw new Error("Impossible de mettre à jour le statut du devis");
  }
}

// Supprimer un devis
export async function deleteQuote(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Session non trouvée");
    }

    await prisma.quote.delete({
      where: { id },
    });

    revalidatePath("/dashboard/quotes");
    return { message: "Devis supprimé avec succès." };
  } catch (error) {
    console.error("Erreur lors de la suppression du devis:", error);
    return {
      message: "Erreur de base de données : Impossible de supprimer le devis.",
    };
  }
}
