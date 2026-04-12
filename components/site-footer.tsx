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
  { href: "/#testimonials", label: "Temoignages" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
  { href: "/terms", label: "CGU" },
  { href: "/privacy", label: "Mentions legales" },
];

const footerSocials = [
  {
    href: "https://discord.com/users/1017721923259613234",
    name: "Discord",
    icon: <DiscordLogoIcon className="size-4" />,
  },
  {
    href: "https://twitter.com/gaelprodev",
    name: "Twitter",
    icon: <TwitterLogoIcon className="size-4" />,
  },
  {
    href: "https://www.linkedin.com/in/ga%C3%ABl-richard-680b8a263/",
    name: "LinkedIn",
    icon: <LinkedInLogoIcon className="size-4" />,
  },
  {
    href: "https://www.malt.fr/profile/gaelrichard44",
    name: "Malt",
    icon: <SiMalt className="size-4" />,
  },
  {
    href: "https://github.com/ParzivalFR",
    name: "GitHub",
    icon: <FaGithub className="size-4" />,
  },
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

  return (
    <footer className="border-t">
      <div className="mx-auto max-w-5xl px-6 py-12 md:px-8">

        {/* Top */}
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">

          {/* Logo + tagline */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-2xl uppercase leading-none"
            >
              GR<span className="text-[#7158ff]">.</span>
            </Link>
            <p className="max-w-[200px] text-center text-sm text-muted-foreground md:text-left">
              {settings.bio || "Développeur freelance — web, desktop & mobile."}
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-end">
            {footerLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-border" />

        {/* Bottom */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {currentYear}{" "}
            <span className="font-semibold text-foreground">
              {settings.fullName || "Gael Richard"}
            </span>
            . Tous droits réservés.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-4">
            {socials.map((s) => (
              <Link
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-[#7158ff]"
              >
                {s.icon}
                <span className="sr-only">{s.name}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
