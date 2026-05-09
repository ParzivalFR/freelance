import Link from "next/link";

export default function PolitiqueConfidentialite() {
  return (
    <section className="container mx-auto bg-background px-4 py-12 md:px-8">
      <div className="shadow-md mx-auto max-w-3xl rounded-lg bg-background p-8 shadow-pxl border border-border/50">
        <h1 className="mb-8 text-center text-4xl font-bold tracking-tight md:text-5xl uppercase font-[family-name:var(--font-display)]">
          Politique de Confidentialite
        </h1>

        <p className="mb-8 text-foreground/80 leading-relaxed">
          La protection de vos données personnelles est une priorité. Cette politique vous informe sur la manière dont nous collectons, utilisons et protégeons vos informations dans le cadre de l'utilisation de ce site, conformément au Règlement Général sur la Protection des Données (RGPD).
        </p>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-[#7158ff]">
            1. Collecte des données
          </h2>
          <p className="mb-4">
            Nous collectons des données via notre formulaire de contact ou lors de vos échanges avec nous. Ces données peuvent inclure :
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Nom et Prénom</li>
            <li>Adresse e-mail</li>
            <li>Nom de l'entreprise (optionnel)</li>
            <li>Détails relatifs à votre projet et budget</li>
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-[#7158ff]">
            2. Finalité du traitement
          </h2>
          <p>
            Vos données sont collectées uniquement pour :
          </p>
          <ul className="list-disc space-y-2 pl-5 mt-2">
            <li>Répondre à vos demandes de contact et devis</li>
            <li>Gérer la relation commerciale avec nos clients</li>
            <li>Améliorer l'expérience utilisateur sur le site</li>
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-[#7158ff]">
            3. Conservation des données
          </h2>
          <p>
            Les données sont conservées pendant la durée nécessaire à la gestion de la relation commerciale (maximum 3 ans après le dernier contact pour les prospects).
          </p>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-[#7158ff]">
            4. Vos droits
          </h2>
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition au traitement de vos données. Pour exercer ce droit, contactez-nous à :{" "}
            <Link href="mailto:gael_pro@ik.me" className="text-[#7158ff] hover:underline">
              gael_pro@ik.me
            </Link>
          </p>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-[#7158ff]">
            5. Cookies
          </h2>
          <p>
            Notre site peut utiliser des cookies pour améliorer votre navigation. Vous pouvez configurer votre navigateur pour refuser les cookies, bien que cela puisse affecter certaines fonctionnalités du site.
          </p>
        </div>

        <time dateTime="2026-05-08" className="mt-12 block text-center text-sm text-muted-foreground">
          Dernière mise à jour : 08/05/2026
        </time>
      </div>
    </section>
  );
}
