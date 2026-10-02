"use client";

import { LayoutDashboard, LogOut, Menu, Shield, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LogoMark } from "./logo";

const links = [
  { label: "Réalisations", href: "/#realisations" },
  { label: "Ce que je fais", href: "/#services" },
  { label: "À propos", href: "/#a-propos" },
  { label: "Avis", href: "/#avis" },
];

export default function SiteNav() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const isAdmin = session?.user?.role === "ADMIN";

  // Au défilement, la barre se resserre en pastille flottante.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Le lien de la section traversée par le milieu de l'écran est mis en avant.
  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.href.split("#")[1]))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
          else setActive((cur) => (cur === e.target.id ? "" : cur));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-3 transition-[padding] duration-300 ease-out",
        scrolled ? "pt-3" : "pt-0"
      )}
    >
      <div
        className={cn(
          "mx-auto flex items-center justify-between gap-4 rounded-full border transition-all duration-300 ease-out",
          scrolled
            ? "max-w-[820px] border-border bg-card/85 py-2 pl-4 pr-2 shadow-[0_10px_34px_-18px_rgba(30,31,36,0.45)] backdrop-blur-md"
            : "max-w-[1120px] border-transparent px-2 py-4"
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 font-[family-name:var(--font-bricolage)] font-bold tracking-tight"
        >
          <LogoMark className="size-8" />
          <span
            className={cn(
              "hidden overflow-hidden whitespace-nowrap transition-all duration-300 ease-out min-[400px]:inline-block",
              scrolled ? "max-w-0 opacity-0 md:max-w-0" : "max-w-[10rem] opacity-100"
            )}
          >
            Gaël Richard
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-[15px] font-medium text-muted-foreground md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-3.5 py-1.5 transition-colors hover:text-foreground",
                active === l.href.split("#")[1] && "bg-accent text-accent-foreground"
              )}
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
            className="whitespace-nowrap rounded-full bg-primary px-[18px] py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-85"
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
        <nav className="mx-auto mt-2 flex max-w-[820px] flex-col gap-1 rounded-3xl border bg-card p-3 shadow-[0_10px_34px_-18px_rgba(30,31,36,0.45)] md:hidden">
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
