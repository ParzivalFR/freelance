"use client";

import { LayoutDashboard, LogOut, Menu, Shield, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

const links = [
  { label: "Réalisations", href: "/#realisations" },
  { label: "Ce que je fais", href: "/#services" },
  { label: "À propos", href: "/#a-propos" },
  { label: "Avis", href: "/#avis" },
];

export default function SiteNav() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-5 py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-[family-name:var(--font-bricolage)] font-bold tracking-tight"
        >
          <span className="grid size-[34px] place-items-center rounded-full bg-primary font-[family-name:var(--font-jetbrains)] text-xs font-medium text-primary-foreground">
            gr
          </span>
          <span className="hidden whitespace-nowrap min-[400px]:inline">Gaël Richard</span>
        </Link>

        <nav className="hidden items-center gap-7 text-[15px] font-medium text-muted-foreground md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={session ? "/dashboard/bot" : "/signin"}
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            {session ? "Mon espace" : "Connexion"}
          </Link>
          <Link
            href="/#contact"
            className="whitespace-nowrap rounded-full bg-primary px-[18px] py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Me contacter
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            className="rounded-full p-2 md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t px-5 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-[15px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <div className="my-1 border-t" />
          {session ? (
            <>
              <Link
                href="/dashboard/bot"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[15px] text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LayoutDashboard className="size-4" />
                Mon espace
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[15px] text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Shield className="size-4" />
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[15px] text-red-600 hover:bg-red-500/10"
              >
                <LogOut className="size-4" />
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              href="/signin"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-[15px] text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Connexion
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
