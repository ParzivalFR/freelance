import Link from "next/link";

const socials = [
  { href: "https://www.linkedin.com/in/ga%C3%ABl-richard-680b8a263/", label: "LinkedIn" },
  { href: "https://www.malt.fr/profile/gaelrichard44", label: "Malt" },
  { href: "https://github.com/ParzivalFR", label: "GitHub" },
  { href: "https://discord.com/users/1017721923259613234", label: "Discord" },
];

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-[1120px] px-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t py-7 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Gaël Richard · gael-dev.fr</span>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              {s.label}
            </a>
          ))}
          <Link href="/mentions-legales" className="transition-colors hover:text-foreground">
            Mentions légales
          </Link>
          <Link href="/politique-de-confidentialite" className="transition-colors hover:text-foreground">
            Confidentialité
          </Link>
        </nav>
      </div>
    </footer>
  );
}
