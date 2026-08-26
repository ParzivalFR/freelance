"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  FilePlus,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Mail,
  MessageSquare,
  RefreshCcw,
  Search,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

const NAV = [
  {
    label: "Activité",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
      { title: "Prospection", url: "/admin/prospection", icon: Search },
    ],
  },
  {
    label: "Contenu",
    items: [
      { title: "Projets", url: "/admin/projects", icon: FolderOpen },
      { title: "Témoignages", url: "/admin/testimonials", icon: MessageSquare },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Clients", url: "/admin/clients", icon: Users },
      { title: "Devis", url: "/admin/devis/list", icon: FileText },
      { title: "Nouveau devis", url: "/admin/devis", icon: FilePlus },
      { title: "Bots Discord", url: "/admin/bots", icon: Bot },
      { title: "Remboursements", url: "/admin/refunds", icon: RefreshCcw },
    ],
  },
  {
    label: "Configuration",
    items: [
      { title: "Paramètres", url: "/admin/settings", icon: Settings },
      { title: "Email Templates", url: "/admin/email-templates", icon: Mail },
    ],
  },
];

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b border-dashed px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
            <Shield className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-mono text-sm font-bold text-foreground">
              GAEL-DEV
            </p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              admin_panel
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu>
                {group.items.map((item) => {
                  // Exact pour les URLs qui sont préfixes d'autres entrées
                  // (/admin, /admin/devis), préfixe pour les pages à sous-routes.
                  const isActive =
                    item.url === "/admin" || item.url === "/admin/devis"
                      ? pathname === item.url
                      : pathname.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="font-mono text-xs data-[active=true]:border data-[active=true]:border-blue-500/30 data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-500"
                      >
                        <Link href={item.url}>
                          <item.icon className="size-3.5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-dashed p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="font-mono text-xs">
              <Link href="/dashboard/bot">
                <Bot className="size-3.5" />
                <span>Dashboard bots</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="font-mono text-xs text-muted-foreground">
              <Link href="/">
                <ArrowLeft className="size-3.5" />
                <span>Retour au site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
