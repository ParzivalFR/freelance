import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { UserDropdown } from "@/components/dashboard/user-dropdown";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Vérification du rôle directement en base — ne pas se fier à la session
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (dbUser?.role !== "ADMIN") {
    redirect("/dashboard/bot");
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-dashed px-4 md:px-6">
          <SidebarTrigger className="-ms-1" />
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="size-3" />
              Voir le site
            </Link>
            <UserDropdown />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="px-4 py-6 md:px-6 lg:px-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
