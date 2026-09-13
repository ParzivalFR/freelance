"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeftRight, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function UserDropdown() {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/signin" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar className="size-8">
            <AvatarImage
              src={session?.user?.image || ""}
              width={32}
              height={32}
              alt="Profile image"
            />
            <AvatarFallback>
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64 p-2" align="end">
        <DropdownMenuLabel className="mb-2 flex min-w-0 flex-col px-1 py-0">
          <span className="mb-0.5 truncate text-sm font-medium text-foreground">
            {session?.user?.name || "Utilisateur"}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {session?.user?.email}
          </span>
        </DropdownMenuLabel>
        {/* Seul un administrateur a deux espaces entre lesquels basculer. */}
        {session?.user?.role === "ADMIN" && (
          <DropdownMenuItem asChild className="gap-3 px-1">
            <Link href="/espaces">
              <ArrowLeftRight
                size={20}
                className="text-muted-foreground/70"
                aria-hidden="true"
              />
              <span>Changer d&apos;espace</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="gap-3 px-1 text-red-600 focus:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut size={20} className="text-red-600" aria-hidden="true" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
