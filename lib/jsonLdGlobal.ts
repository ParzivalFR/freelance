// lib/seo/jsonLdGlobal.ts

export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://astro-saint-nazaire.fr/#organization",
      name: "Association Nazairienne d'Astronomie",
      legalName: "Association Nazairienne d'Astronomie",
      foundingDate: "1999-01-01",
      url: "https://astro-saint-nazaire.fr",
      logo: "https://astro-saint-nazaire.fr/logo.png", // à ajouter dans public/
      image: "https://astro-saint-nazaire.fr/og-image.jpg",
      description:
        "Club d'astronomie à Saint-Nazaire depuis 1999. Observations publiques, astrophotographie, télescope Dobson 400mm.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "41 bis rue Mansard",
        addressLocality: "Saint-Nazaire",
        postalCode: "44600",
        addressRegion: "Pays de la Loire",
        addressCountry: "FR",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "information",
        email: "club.astro.saint.nazaire@laposte.net",
        availableLanguage: "French",
      },
      sameAs: [
        // Ajoute les réseaux sociaux si dispos
        "https://facebook.com/tonassociation",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://astro-saint-nazaire.fr/#website",
      url: "https://astro-saint-nazaire.fr",
      name: "Association Nazairienne d'Astronomie",
      description:
        "Club d'astronomie à Saint-Nazaire depuis 1999. Observations publiques, astrophotographie, télescope Dobson 400mm.",
      publisher: {
        "@id": "https://astro-saint-nazaire.fr/#organization",
      },
      inLanguage: "fr-FR",
    },
  ],
};
