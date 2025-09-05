import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { UserDropdown } from "@/components/dashboard/user-dropdown";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect if not authenticated or not admin
  if (!session?.user?.email) {
    redirect("/signin");
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="group/sidebar-inset bg-sidebar">
        <header className="dark relative flex h-16 shrink-0 items-center gap-2 bg-sidebar px-4 text-sidebar-foreground before:absolute before:inset-y-3 before:-left-px before:z-50 before:w-px before:bg-gradient-to-b before:from-white/5 before:via-white/15 before:to-white/5 md:px-6 lg:px-8">
          <SidebarTrigger className="-ms-2" />
          <div className="ml-auto flex items-center gap-8">
            <nav className="hidden items-center text-sm font-medium md:flex">
              <Link
                className="text-sidebar-foreground/50 transition-colors before:px-4 before:text-sidebar-foreground/30 before:content-['/'] first:before:hidden hover:text-sidebar-foreground/70 [&[aria-current]]:text-sidebar-foreground"
                href="/admin"
              >
                Dashboard
              </Link>
              <Link
                className="text-sidebar-foreground/50 transition-colors before:px-4 before:text-sidebar-foreground/30 before:content-['/'] first:before:hidden hover:text-sidebar-foreground/70 [&[aria-current]]:text-sidebar-foreground"
                href="/admin/projects"
              >
                Projets
              </Link>
              <Link
                className="text-sidebar-foreground/50 transition-colors before:px-4 before:text-sidebar-foreground/30 before:content-['/'] first:before:hidden hover:text-sidebar-foreground/70 [&[aria-current]]:text-sidebar-foreground"
                href="/admin/testimonials"
              >
                Témoignages
              </Link>
              <Link
                className="text-sidebar-foreground/50 transition-colors before:px-4 before:text-sidebar-foreground/30 before:content-['/'] first:before:hidden hover:text-sidebar-foreground/70 [&[aria-current]]:text-sidebar-foreground"
                href="/admin/clients"
              >
                Clients
              </Link>
              <Link
                className="text-sidebar-foreground/50 transition-colors before:px-4 before:text-sidebar-foreground/30 before:content-['/'] first:before:hidden hover:text-sidebar-foreground/70 [&[aria-current]]:text-sidebar-foreground"
                href="/admin/devis"
              >
                Devis
              </Link>
            </nav>
            <UserDropdown />
          </div>
        </header>
        <div className="md:group-peer-data-[state=collapsed]/sidebar-inset:rounded-s-none flex h-[calc(100dvh-4rem)] bg-background transition-all duration-300 ease-in-out md:rounded-s-3xl">
          <main className="flex-1 overflow-auto">
            <div className="flex h-full flex-col px-4 py-6 md:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
