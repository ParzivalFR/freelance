"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Activity,
  Bot,
  BookOpen,
  LayoutDashboard,
  LogOut,
  MoreVertical,
  Puzzle,
  Rocket,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { FaDiscord } from "react-icons/fa";

function buildNav(botId: string) {
  return [
    {
      label: "Système",
      items: [
        { title: "Vue d'ensemble", url: `/dashboard/bot/${botId}`, icon: LayoutDashboard, exact: true },
        { title: "Guide de configuration", url: `/dashboard/bot/${botId}/guide`, icon: BookOpen, exact: false },
      ],
    },
    {
      label: "Configuration",
      items: [
        { title: "Identité & Token", url: `/dashboard/bot/${botId}/config`, icon: Bot, exact: false },
        { title: "Modules", url: `/dashboard/bot/${botId}/modules`, icon: Puzzle, exact: false },
        { title: "Déploiement", url: `/dashboard/bot/${botId}/deploy`, icon: Rocket, exact: false },
      ],
    },
    {
      label: "Monitoring",
      items: [
        { title: "Logs système", url: `/dashboard/bot/${botId}/logs`, icon: Shield, exact: false },
        { title: "Activité", url: `/dashboard/bot/${botId}/activity`, icon: Activity, exact: false },
      ],
    },
  ];
}

export function BotSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const params = useParams();
  const botId = params?.botId as string | undefined;

  const nav = botId ? buildNav(botId) : [];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard/bot">
                <div className="flex size-5 items-center justify-center rounded bg-blue-500/20 text-blue-400">
                  <FaDiscord className="size-3.5" />
                </div>
                <span className="font-mono text-sm font-bold">← Mes bots</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {nav.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="font-mono text-[9px] uppercase tracking-widest text-sidebar-foreground/40">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.url
                    : pathname === item.url || pathname.startsWith(item.url + "/");
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className="font-mono text-xs data-[active=true]:border data-[active=true]:border-blue-500/30 data-[active=true]:bg-blue-500/10 data-[active=true]:text-blue-500"
                      >
                        <Link href={item.url}>
                          <item.icon size={14} />
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={session?.user?.image ?? ""} alt="Avatar" />
                    <AvatarFallback className="rounded-lg text-xs">
                      {session?.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {session?.user?.name ?? "Utilisateur"}
                    </span>
                    <span className="truncate font-mono text-[10px] text-muted-foreground">
                      {session?.user?.email}
                    </span>
                  </div>
                  <MoreVertical className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/signin" })}
                  className="text-red-500 focus:text-red-500"
                >
                  <LogOut className="size-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
