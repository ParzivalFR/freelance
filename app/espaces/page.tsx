import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EspacesView } from "./espaces-view";

export const metadata: Metadata = {
  title: "Choisir un espace",
  robots: { index: false, follow: false },
};

/**
 * Aiguillage affiché à la connexion.
 *
 * Un administrateur a deux espaces et aucune raison d'être poussé d'office
 * vers l'un des deux. Un client n'en a qu'un : il ne voit pas cette page, la
 * redirection se fait côté serveur, donc sans clignotement.
 */
export default async function EspacesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  // Le rôle est relu en base plutôt que dans la session, comme dans /admin :
  // une session peut dater d'avant un changement de rôle.
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") redirect("/dashboard/bot");

  return <EspacesView prenom={session.user.name?.split(" ")[0] ?? "toi"} />;
}
