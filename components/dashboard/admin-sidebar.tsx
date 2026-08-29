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
  Image as ImageIcon,
  LayoutDashboard,
  Mail,
  MessageSquare,
  RefreshCcw,
  Search,
  Settings,
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
      { title: "Visuels réseaux", url: "/admin/social", icon: ImageIcon },
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
      <SidebarHeader className="border-b px-4 py-4">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#7158ff] text-white ring-4 ring-[#7158ff]/20">
            <span className="font-[family-name:var(--font-display)] text-sm leading-none">G</span>
          </div>
          <div className="min-w-0">
            <p className="truncate font-[family-name:var(--font-display)] text-lg uppercase leading-none text-foreground">
              Gael-Dev
            </p>
            <p className="font-[family-name:var(--font-handwriting)] text-sm leading-tight text-[#7158ff]">
              Espace admin
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
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
                        className="rounded-xl text-sm font-medium data-[active=true]:bg-[#7158ff]/10 data-[active=true]:font-semibold data-[active=true]:text-[#7158ff]"
                      >
                        <Link href={item.url}>
                          <item.icon className="size-4" />
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

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="rounded-xl text-sm font-medium">
              <Link href="/dashboard/bot">
                <Bot className="size-4" />
                <span>Dashboard bots</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="rounded-xl text-sm font-medium text-muted-foreground">
              <Link href="/">
                <ArrowLeft className="size-4" />
                <span>Retour au site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
