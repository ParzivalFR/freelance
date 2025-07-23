// components/dashboard/app-sidebar.tsx
"use client";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavSecondary } from "@/components/dashboard/nav-secondary";
import { NavUser } from "@/components/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Database,
  FileText,
  HelpCircle,
  Home,
  Search,
  Settings,
  User,
  Users,
} from "lucide-react";
import type { Session } from "next-auth";
import type * as React from "react";

const data = {
  user: {
    name: "Gaël Richard",
    email: "parzivaleu@gmail.com",
    avatar: "/photo-de-profil.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Home,
    },
    {
      title: "Clients",
      url: "/admin/clients",
      icon: Users,
    },
  ],
  navSecondary: [
    {
      title: "Paramètres",
      url: "/admin/settings",
      icon: Settings,
    },
    {
      title: "Aide",
      url: "/admin/help",
      icon: HelpCircle,
    },
    {
      title: "Recherche",
      url: "/admin/search",
      icon: Search,
    },
  ],
  documents: [
    {
      name: "Base de données",
      url: "/admin/database",
      icon: Database,
    },
    {
      name: "Rapports",
      url: "/admin/reports",
      icon: FileText,
    },
    {
      name: "Documents",
      url: "/admin/documents",
      icon: FileText,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session: Session;
}

export function AppSidebar({ session, ...props }: AppSidebarProps) {
  const userData = {
    name: session.user?.name || data.user.name,
    email: session.user?.email || data.user.email,
    avatar: session.user?.image || data.user.avatar,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <User className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Gael Richard</span>
                  <span className="truncate text-xs">Développeur</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
