import Link from "next/link";

export default function Terms() {
  return (
    <section className="container mx-auto bg-background px-4 py-12 md:px-8">
      <div className="shadow-md mx-auto max-w-3xl rounded-lg bg-background p-8 shadow-pxl">
        <h1 className="mb-8 text-center text-4xl font-bold tracking-tight md:text-5xl">
          Conditions d'Utilisation
        </h1>

        <p className="mb-12 text-center text-sm ">
          En utilisant ce site, vous acceptez les présentes conditions
          d'utilisation. Veuillez les lire attentivement.
        </p>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2  text-2xl font-semibold">
            1. Acceptation des conditions
          </h2>
          <p className="">
            En accédant à ce site, vous acceptez d'être lié par ces conditions
            d'utilisation, toutes les lois et réglementations applicables, et
            vous acceptez que vous êtes responsable du respect des lois locales
            applicables.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2  text-2xl font-semibold">
            2. Utilisation de la licence
          </h2>
          <p className="">
            La permission est accordée de télécharger temporairement une copie
            des matériaux (informations ou logiciels) sur le site de Gaël
            Richard uniquement pour une visualisation transitoire personnelle et
            non commerciale. Il s'agit de l'octroi d'une licence, et non d'un
            transfert de titre.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2  text-2xl font-semibold">
            3. Clause de non-responsabilité
          </h2>
          <p className="">
            Les matériaux sur le site de Gaël Richard sont fournis "tels quels".
            Gaël Richard ne donne aucune garantie, expresse ou implicite, et
            décline et nie par la présente toutes les autres garanties, y
            compris, sans limitation, les garanties implicites ou les conditions
            de qualité marchande, d'adéquation à un usage particulier, ou de
            non-violation de la propriété intellectuelle ou autre violation des
            droits.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2  text-2xl font-semibold">
            4. Limitations
          </h2>
          <p className="">
            En aucun cas, Gaël Richard ou ses fournisseurs ne seront
            responsables des dommages (y compris, sans limitation, les dommages
            pour perte de données ou de profit, ou en raison d'une interruption
            d'activité) découlant de l'utilisation ou de l'impossibilité
            d'utiliser les matériaux sur le site de Gaël Richard, même si Gaël
            Richard ou un représentant autorisé de Gaël Richard a été notifié
            oralement ou par écrit de la possibilité de tels dommages.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2  text-2xl font-semibold">
            5. Révisions et errata
          </h2>
          <p className="">
            Les matériaux apparaissant sur le site de Gaël Richard peuvent
            inclure des erreurs techniques, typographiques ou photographiques.
            Gaël Richard ne garantit pas que l'un des matériaux sur son site web
            est exact, complet ou à jour. Gaël Richard peut apporter des
            modifications aux matériaux contenus sur son site web à tout moment
            sans préavis.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2  text-2xl font-semibold">
            6. Liens
          </h2>
          <p className="">
            Gaël Richard n'a pas examiné tous les sites liés à son site Internet
            et n'est pas responsable du contenu de ces sites liés. L'inclusion
            de tout lien n'implique pas l'approbation par Gaël Richard du site.
            L'utilisation de tout site web lié est aux risques et périls de
            l'utilisateur.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2  text-2xl font-semibold">
            7. Modifications des conditions d'utilisation du site
          </h2>
          <p className="">
            Gaël Richard peut réviser ces conditions d'utilisation de son site
            web à tout moment sans préavis. En utilisant ce site web, vous
            acceptez d'être lié par la version alors en vigueur de ces
            conditions d'utilisation.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2  text-2xl font-semibold">
            8. Loi applicable
          </h2>
          <p className="">
            Toute réclamation relative au site web de Gaël Richard sera régie
            par les lois de la France sans égard à ses dispositions en matière
            de conflit de lois.
          </p>
        </div>

        <p className=" mt-8">
          Pour toute question concernant ces conditions d'utilisation, veuillez
          nous contacter à :{" "}
          <Link
            href="mailto:hello@gael-dev.fr"
            className="text-blue-600 hover:underline"
          >
            hello@gael-dev.fr
          </Link>
        </p>

        <time
          dateTime="2024-08-02"
          className="mt-12 block  text-center text-sm"
        >
          Dernière mise à jour : 02/08/2024
        </time>
      </div>
    </section>
  );
}
