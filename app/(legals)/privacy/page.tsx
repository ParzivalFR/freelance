import Link from "next/link";

export default function Privacy() {
  return (
    <section className="container mx-auto px-4 md:px-8 py-12 bg-background">
      <div className="mx-auto max-w-3xl bg-background shadow-pxl p-8 rounded-lg shadow-md">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 text-center">
          Mentions légales
        </h1>

        <p className="text-sm text-center text-foreground/50 mb-12">
          Nous avons pour obligation de vous informer sur les données que nous
          collectons et l'utilisation que nous en faisons. Nous nous engageons à
          respecter votre vie privée et à protéger les informations que vous
          nous communiquez. Nous ne vendons ni ne louons vos informations
          personnelles à des tiers à des fins de marketing sans votre
          consentement.
        </p>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
            Informations sur l'éditeur du site
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Nom : Gaël Richard</li>
            <li>Statut : Entrepreneur individuel / Auto-entrepreneur</li>
            <li>
              Adresse : 7 rue du pré de la ramée, 44550 Montoir De Bretagne.
            </li>
            <li>
              Numéro de téléphone :{" "}
              <Link
                href="tel:+33633364094"
                className="text-blue-600 hover:underline"
              >
                +33 6 33 36 40 94
              </Link>
            </li>
            <li>
              Adresse e-mail :{" "}
              <Link
                href="mailto:gael_pro@ik.me"
                className="text-blue-600 hover:underline"
              >
                gael_pro@ik.me
              </Link>
            </li>
            <li>Numéro SIRET : 93044860000013</li>
            <li>Numéro de SIREN : 930448600</li>
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
            Informations sur l'hébergeur du site
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Nom : BE1HOST SAS</li>
            <li>
              Adresse : 14 rue Charles-V 75004 Paris - 75007 Paris - France
            </li>
            <li>
              Numéro de téléphone :{" "}
              <Link
                href="tel:0972546363"
                className="text-blue-600 hover:underline"
              >
                09 72 54 63 63
              </Link>
            </li>
            <li>
              Adresse e-mail :{" "}
              <Link
                href="mailto:jordan@inovaperf.fr"
                className="text-blue-600 hover:underline"
              >
                jordan@inovaperf.fr
              </Link>
            </li>
            <li>Numéro SIRET : 80142522400020</li>
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
            Propriété intellectuelle
          </h2>
          <p>
            Tous les éléments du site sont la propriété exclusive de Gaël
            Richard. Toute reproduction, représentation ou diffusion, en tout ou
            partie, du contenu de ce site sur quelque support ou par tout
            procédé que ce soit est interdite. Le non-respect de cette
            interdiction constitue une contrefaçon susceptible d'engager la
            responsabilité civile et pénale du contrefacteur.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
            Protection des données personnelles
          </h2>
          <p>
            Conformément à la loi n°78-17 du 6 janvier 1978 relative à
            l'informatique, aux fichiers et aux libertés, vous disposez d'un
            droit d'accès, de rectification, de suppression des données vous
            concernant. Pour exercer ce droit, il vous suffit de nous contacter
            par e-mail à l'adresse suivante :{" "}
            <Link
              href="mailto:hello@gael-dev.fr"
              className="text-blue-600 hover:underline"
            >
              hello@gael-dev.fr
            </Link>
            .
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Cookies</h2>
          <p>
            Les cookies sont des fichiers stockés sur votre ordinateur par les
            sites web que vous visitez. Ils sont largement utilisés pour faire
            fonctionner les sites web, ou les faire fonctionner plus
            efficacement, ainsi que pour fournir des informations aux
            propriétaires du site.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
            Utilisation des cookies
          </h2>
          <p>
            En visitant notre site web, vous consentez à l'utilisation de
            cookies et d'autres technologies. Ces cookies sont utilisés pour
            stocker des informations, telles que vos préférences personnelles
            lorsque vous visitez notre site. Cela pourrait inclure uniquement
            vous montrer une bannière une fois dans votre visite, ou la capacité
            de vous connecter à certaines de nos fonctionnalités, telles que les
            forums.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
            Limitation de responsabilité
          </h2>
          <p>
            Gael Richard s'efforce d'assurer l'exactitude et la mise à jour des
            informations diffusées sur ce site, dont il se réserve le droit de
            corriger le contenu à tout moment et sans préavis. Toutefois, Gael
            Richard ne peut garantir l'exactitude, la précision ou
            l'exhaustivité des informations mises à disposition sur ce site.
          </p>
        </div>

        <time dateTime="2024-08-02" className="block text-sm mt-12 text-center">
          Dernière mise à jour : 02/08/2024
        </time>
      </div>
    </section>
  );
}
