import { DiscordLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import Blob from "./Blob";

const footerNavs = [
  {
    label: "Product",
    items: [
      {
        href: "/",
        name: "Email Collection",
      },
      {
        href: "/pricing",
        name: "Pricing",
      },
      {
        href: "/faq",
        name: "FAQ",
      },
    ],
  },

  {
    label: "Community",
    items: [
      {
        href: "/",
        name: "Discord",
      },
      {
        href: "/",
        name: "Twitter",
      },
      {
        href: "mailto:hello@chatcollect.com",
        name: "Email",
      },
    ],
  },
  {
    label: "Legal",
    items: [
      {
        href: "/terms",
        name: "Terms",
      },

      {
        href: "/privacy",
        name: "Privacy",
      },
    ],
  },
];

const footerSocials = [
  {
    href: "",
    name: "Discord",
    icon: <DiscordLogoIcon className="h-4 w-4" />,
  },
  {
    href: "",
    name: "Twitter",
    icon: <TwitterLogoIcon className="h-4 w-4" />,
  },
];

export function SiteFooter() {
  return (
    <footer className="footer-border">
      <div className="mx-auto w-full max-w-screen-xl xl:pb-2">
        <div className="md:flex md:justify-between px-8 p-4 py-16 sm:pb-16 gap-4">
          <div className="mb-12 flex-col flex gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 self-center sm:self-start text-4xl font-extrabold whitespace-nowrap dark:text-primary"
            >
              <Blob className="size-24" />
            </Link>
            <p className="max-w-xs w-full self-center text-center text-primary/70">
              Partenaire de votre satisfaction.
            </p>
          </div>
          <div className="grid grid-cols-2 place-items-center sm:place-items-start gap-10 sm:grid-cols-3">
            {footerNavs.map((nav) => (
              <div key={nav.label}>
                <h2 className="mb-4 text-sm text-center sm:text-start tracking-tighter font-medium text-primary/80 uppercase dark:text-primary">
                  {nav.label}
                </h2>
                <ul className="flex flex-col gap-1 items-center">
                  {nav.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="cursor-pointer text-primary/50 hover:text-primary duration-200 font-[450] text-sm"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex sm:items-center sm:justify-between rounded-md border-neutral-700/20 py-4 px-8 gap-2">
          <div className="flex space-x-5 justify-center sm:justify-start sm:mt-0">
            {footerSocials.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-600 fill-gray-500 hover:fill-gray-900 dark:hover:fill-gray-600"
              >
                {social.icon}
                <span className="sr-only">{social.name}</span>
              </Link>
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-500 text-center dark:text-gray-400">
            Copyright © {new Date().getFullYear()}{" "}
            <Link href="/" className="cursor-pointer font-extrabold">
              OASIS.
            </Link>{" "}
            Tous droits réservés.
          </span>
        </div>
      </div>
    </footer>
  );
}
