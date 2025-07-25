"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronUp, Plus } from "lucide-react";
import Image from "next/image";
import * as React from "react";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: string;
  }[];
}) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0] ?? null);

  if (!teams.length) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="gap-3 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground [&>svg]:size-auto"
            >
              <div className="relative flex aspect-square size-9 items-center justify-center overflow-hidden rounded-md bg-sidebar-primary text-sidebar-primary-foreground after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[0_1px_2px_0_rgb(0_0_0/.05),inset_0_1px_0_0_rgb(255_255_255/.12)]">
                {activeTeam && (
                  <Image
                    src={activeTeam.logo}
                    width={36}
                    height={36}
                    alt={activeTeam.name}
                  />
                )}
              </div>
              <div className="grid flex-1 text-left text-base leading-tight">
                <span className="truncate font-medium">
                  {activeTeam?.name ?? "Select a Team"}
                </span>
              </div>
              <ChevronUp
                className="ms-auto text-sidebar-foreground/50"
                size={20}
                aria-hidden="true"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="dark w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-md"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs uppercase text-muted-foreground/70">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center overflow-hidden rounded-md">
                  <Image
                    src={team.logo}
                    width={36}
                    height={36}
                    alt={team.name}
                  />
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <Plus className="opacity-60" size={16} aria-hidden="true" />
              <div className="font-medium">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
