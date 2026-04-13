"use client";

import {
  DiscordLogoIcon,
  LinkedInLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import { FaGithub } from "react-icons/fa";
import { SiMalt } from "react-icons/si";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Settings {
  fullName?: string;
  bio?: string;
  profileImage?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
}

const footerLinks = [
  { href: "/#about", label: "A propos" },
  { href: "/#pricing", label: "Tarifs" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
  { href: "/privacy", label: "Mentions legales" },
];

const footerSocials = [
  { href: "https://discord.com/users/1017721923259613234", name: "Discord", icon: <DiscordLogoIcon className="size-4" /> },
  { href: "https://twitter.com/gaelprodev", name: "Twitter", icon: <TwitterLogoIcon className="size-4" /> },
  { href: "https://www.linkedin.com/in/ga%C3%ABl-richard-680b8a263/", name: "LinkedIn", icon: <LinkedInLogoIcon className="size-4" /> },
  { href: "https://www.malt.fr/profile/gaelrichard44", name: "Malt", icon: <SiMalt className="size-4" /> },
  { href: "https://github.com/ParzivalFR", name: "GitHub", icon: <FaGithub className="size-4" /> },
];

export function SiteFooter() {
  const [currentYear, setCurrentYear] = useState("");
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
    const load = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) setSettings(await res.json());
      } catch {}
    };
    load();
  }, []);

  const dynamicSocials = [
    settings.twitterUrl && { href: settings.twitterUrl, name: "Twitter", icon: <TwitterLogoIcon className="size-4" /> },
    settings.linkedinUrl && { href: settings.linkedinUrl, name: "LinkedIn", icon: <LinkedInLogoIcon className="size-4" /> },
    settings.githubUrl && { href: settings.githubUrl, name: "GitHub", icon: <FaGithub className="size-4" /> },
  ].filter(Boolean) as typeof footerSocials;

  const socials = dynamicSocials.length > 0 ? dynamicSocials : footerSocials;
  const name = settings.fullName || "Gael Richard";

  return (
    <footer className="relative overflow-hidden bg-background">

      {/* Glow violet en haut */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#7158ff]/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-[#7158ff]/5 to-transparent" />

      {/* GR. décoratif en fond */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute inset-0 flex items-center justify-center font-[family-name:var(--font-display)] text-[40vw] uppercase leading-none text-foreground/[0.04] md:text-[20vw]"
      >
        GR<span className="text-[#7158ff]/[0.04]">.</span>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 md:px-8">
        <div className="flex flex-col items-center gap-8 text-center">
          <Link href="/" className="font-[family-name:var(--font-display)] text-3xl uppercase leading-none">
            GR<span className="text-[#7158ff]">.</span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {footerLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            {socials.map((s) => (
              <Link key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-[#7158ff]">
                {s.icon}
                <span className="sr-only">{s.name}</span>
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">© {currentYear} {name}. Tous droits réservés.</p>
        </div>
      </div>

    </footer>
  );
}
