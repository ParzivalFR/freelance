// components/site-nav.tsx
"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { label: "Témoignages", href: "/#testimonials" },
  { label: "Tarifs", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

export default function SiteNav() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">

        {/* ── Desktop : pill flottante ── */}
        <div
          className={cn(
            "hidden w-full max-w-2xl items-center justify-between rounded-full border px-5 py-2.5 transition-all duration-300 md:flex bg-background/95 backdrop-blur-lg",
            scrolled
              ? "border-border shadow-lg"
              : "border-[#7158ff]/40 shadow-md shadow-[#7158ff]/10"
          )}
        >
          <Link href="/" className="font-[family-name:var(--font-display)] text-xl uppercase leading-none">
            GR<span className="text-[#7158ff]">.</span>
          </Link>

          <nav className="flex items-center gap-6">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session ? (
              <Link href="/dashboard/bot" className="rounded-full border border-border px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                Dashboard
              </Link>
            ) : (
              <Link href="/signin" className="rounded-full border border-border px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                Connexion
              </Link>
            )}
            <Link href="/#contact" className="rounded-full bg-[#7158ff] px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-85">
              Contact
            </Link>
          </div>
        </div>

        {/* ── Mobile : pill compacte ── */}
        <div
          className={cn(
            "flex w-full items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-300 md:hidden bg-background/95 backdrop-blur-lg",
            scrolled
              ? "border-border shadow-lg"
              : "border-[#7158ff]/40 shadow-md shadow-[#7158ff]/10"
          )}
        >
          <Link href="/" className="font-[family-name:var(--font-display)] text-xl uppercase leading-none">
            GR<span className="text-[#7158ff]">.</span>
          </Link>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setOpen((p) => !p)}
              className="rounded-full p-1.5 text-foreground transition-colors hover:bg-muted"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={open ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  {open ? <X className="size-5" /> : <Menu className="size-5" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile animé */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-[5.25rem] z-40 origin-top rounded-2xl border border-[#7158ff]/20 bg-background/95 px-3 py-3 shadow-lg shadow-[#7158ff]/5 backdrop-blur-lg md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              {session ? (
                <Link href="/dashboard/bot" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  Dashboard
                </Link>
              ) : (
                <Link href="/signin" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  Connexion
                </Link>
              )}
              <Link
                href="/#contact"
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-xl bg-[#7158ff] px-4 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-85"
              >
                Me contacter
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer réduit sur mobile */}
      <div className="h-14 md:h-16" />
    </>
  );
}
