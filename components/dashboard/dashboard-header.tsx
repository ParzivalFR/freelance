"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeftRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BREADCRUMBS: Record<string, string> = {
  "/dashboard/bot": "Vue d'ensemble",
  "/dashboard/bot/config": "Identité & Token",
  "/dashboard/bot/modules": "Modules",
  "/dashboard/bot/deploy": "Déploiement",
  "/dashboard/bot/logs": "Logs système",
  "/dashboard/bot/activity": "Activité",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const label = BREADCRUMBS[pathname] ?? "Dashboard";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="text-muted-foreground/40">dashboard</span>
          <span className="text-muted-foreground/30">/</span>
          <span className="text-blue-500">{label}</span>
        </div>

        {/* Sans ce retour, un administrateur ne peut regagner /admin qu'en
            tapant l'URL. Invisible pour un client, qui n'a qu'un espace. */}
        {isAdmin && (
          <Link
            href="/espaces"
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[#7158ff]/40 hover:text-[#7158ff]"
          >
            <ArrowLeftRight className="size-3" />
            Changer d&apos;espace
          </Link>
        )}
      </div>
    </header>
  );
}
