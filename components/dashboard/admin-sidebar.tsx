"use client";

import { TeamSwitcher } from "@/components/dashboard/team-switcher";
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
  BarChart3,
  FolderOpen,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Search,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

// Data for the sidebar
const data = {
  teams: [
    {
      name: "Freelance Portfolio",
      logo: "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp2/logo-01_upxvqe.png",
    },
  ],
  navMain: [
    {
      title: "Administration",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "/admin",
          icon: LayoutDashboard,
        },
        {
          title: "Projets",
          url: "/admin/projects",
          icon: FolderOpen,
        },
        {
          title: "Témoignages",
          url: "/admin/testimonials",
          icon: MessageSquare,
        },
        {
          title: "Clients",
          url: "/admin/clients",
          icon: Users,
        },
        {
          title: "Analytics",
          url: "/admin/analytics",
          icon: BarChart3,
        },
        {
          title: "Prospection",
          url: "/admin/prospection",
          icon: Search,
        },
      ],
    },
    {
      title: "Configuration",
      url: "#",
      items: [
        {
          title: "Paramètres",
          url: "/admin/settings",
          icon: Settings,
        },
        {
          title: "Email Templates",
          url: "/admin/email-templates",
          icon: Mail,
        },
      ],
    },
  ],
};

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props} className="dark !border-none">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase text-sidebar-foreground/70">
            {data.navMain[0]?.title}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {data.navMain[0]?.items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="group/menu-button text-sidebar-foreground/80 hover:text-sidebar-foreground/90 hover:bg-white/5 data-[active=true]:shadow-lg h-9 gap-3 rounded-md font-medium data-[active=true]:border data-[active=true]:border-white/20 data-[active=true]:bg-white/10 data-[active=true]:text-white data-[active=true]:shadow-white/10 data-[active=true]:backdrop-blur-md data-[active=true]:hover:bg-white/15 [&>svg]:size-auto"
                      isActive={isActive}
                    >
                      <Link href={item.url}>
                        {item.icon && (
                          <item.icon
                            className="text-sidebar-foreground/70 group-hover/menu-button:text-sidebar-foreground/80 group-data-[active=true]/menu-button:text-white"
                            size={22}
                            aria-hidden="true"
                          />
                        )}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase text-sidebar-foreground/70">
            {data.navMain[1]?.title}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {data.navMain[1]?.items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="group/menu-button text-sidebar-foreground/80 hover:text-sidebar-foreground/90 hover:bg-white/5 data-[active=true]:shadow-lg h-9 gap-3 rounded-md font-medium data-[active=true]:border data-[active=true]:border-white/20 data-[active=true]:bg-white/10 data-[active=true]:text-white data-[active=true]:shadow-white/10 data-[active=true]:backdrop-blur-md data-[active=true]:hover:bg-white/15 [&>svg]:size-auto"
                      isActive={isActive}
                    >
                      <Link href={item.url}>
                        {item.icon && (
                          <item.icon
                            className="text-sidebar-foreground/70 group-hover/menu-button:text-sidebar-foreground/80 group-data-[active=true]/menu-button:text-white"
                            size={22}
                            aria-hidden="true"
                          />
                        )}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
