// app/actions/client.ts
"use server";

import { auth } from "@/lib/auth"; // Import correct du fichier auth.ts à la racine
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schéma de validation pour un client (sans l'id qui est auto-généré)
const ClientSchema = z.object({
  firstName: z.string().min(1, "Le prénom est obligatoire").max(50),
  lastName: z.string().min(1, "Le nom est obligatoire").max(50),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  address: z.string().optional(),
  isProfessional: z.boolean().default(false),
  subject: z.string().optional(),
  internalNote: z.string().optional(),
});

// Créer un client
export async function createClient(prevState: any, formData: FormData) {
  try {
    // Pas besoin de vérification d'auth, le middleware s'en charge
    const session = await auth();
    if (!session?.user) {
      throw new Error("Session non trouvée");
    }

    const rawFormData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      isProfessional: formData.get("isProfessional") === "on",
      subject: (formData.get("subject") as string) || undefined,
      internalNote: (formData.get("internalNote") as string) || undefined,
    };

    // Validation avec Zod
    const validatedFields = ClientSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Champs invalides. Impossible de créer le client.",
      };
    }

    // Validation business : adresse obligatoire si professionnel
    if (
      validatedFields.data.isProfessional &&
      !validatedFields.data.address?.trim()
    ) {
      return {
        errors: {
          address: [
            "L'adresse est obligatoire pour les clients professionnels",
          ],
        },
        message: "Adresse requise pour les clients professionnels.",
      };
    }

    // Créer le client avec les données validées
    await prisma.client.create({
      data: {
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        email: validatedFields.data.email,
        phone: validatedFields.data.phone,
        address: validatedFields.data.address,
        isProfessional: validatedFields.data.isProfessional,
        subject: validatedFields.data.subject,
        internalNote: validatedFields.data.internalNote,
      },
    });

    revalidatePath("/dashboard/clients");
    return { message: "Client créé avec succès." };
  } catch (error) {
    console.error("Erreur lors de la création du client:", error);

    // Gestion spécifique de l'erreur d'email unique
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        errors: { email: ["Cet email est déjà utilisé par un autre client"] },
        message: "Email déjà existant.",
      };
    }

    return {
      message: "Erreur de base de données : Impossible de créer le client.",
    };
  }
}

// Récupérer tous les clients
export async function getClients() {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Session non trouvée");
    }

    const clients = await prisma.client.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return clients;
  } catch (error) {
    console.error("Erreur lors de la récupération des clients:", error);
    throw new Error("Impossible de récupérer les clients");
  }
}

// Récupérer un client par ID
export async function getClientById(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Session non trouvée");
    }

    const client = await prisma.client.findUnique({
      where: { id },
    });

    return client;
  } catch (error) {
    console.error("Erreur lors de la récupération du client:", error);
    throw new Error("Impossible de récupérer le client");
  }
}

// Mettre à jour un client
export async function updateClient(
  id: string,
  prevState: any,
  formData: FormData
) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Session non trouvée");
    }

    const rawFormData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      isProfessional: formData.get("isProfessional") === "on",
      subject: (formData.get("subject") as string) || undefined,
      internalNote: (formData.get("internalNote") as string) || undefined,
    };

    const validatedFields = ClientSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Champs invalides. Impossible de modifier le client.",
      };
    }

    // Validation business
    if (
      validatedFields.data.isProfessional &&
      !validatedFields.data.address?.trim()
    ) {
      return {
        errors: {
          address: [
            "L'adresse est obligatoire pour les clients professionnels",
          ],
        },
        message: "Adresse requise pour les clients professionnels.",
      };
    }

    await prisma.client.update({
      where: { id },
      data: {
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        email: validatedFields.data.email,
        phone: validatedFields.data.phone,
        address: validatedFields.data.address,
        isProfessional: validatedFields.data.isProfessional,
        subject: validatedFields.data.subject,
        internalNote: validatedFields.data.internalNote,
      },
    });

    revalidatePath("/dashboard/clients");
    return { message: "Client mis à jour avec succès." };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du client:", error);
    return {
      message: "Erreur de base de données : Impossible de modifier le client.",
    };
  }
}

// Supprimer un client
export async function deleteClient(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Session non trouvée");
    }

    await prisma.client.delete({
      where: { id },
    });

    revalidatePath("/dashboard/clients");
    return { message: "Client supprimé avec succès." };
  } catch (error) {
    console.error("Erreur lors de la suppression du client:", error);
    return {
      message: "Erreur de base de données : Impossible de supprimer le client.",
    };
  }
}
