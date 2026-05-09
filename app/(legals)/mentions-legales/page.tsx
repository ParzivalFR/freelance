import Link from "next/link";

export default function MentionsLegales() {
  return (
    <section className="container mx-auto bg-background px-4 py-12 md:px-8">
      <div className="shadow-md mx-auto max-w-3xl rounded-lg bg-background p-8 shadow-pxl border border-border/50">
        <h1 className="mb-8 text-center text-4xl font-bold tracking-tight md:text-5xl uppercase font-[family-name:var(--font-display)]">
          Mentions Legales
        </h1>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-[#7158ff]">
            1. Éditeur du site
          </h2>
          <p className="mb-4">
            En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, il est précisé aux utilisateurs du site l'identité de l'éditeur :
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Nom :</strong> Gaël Richard</li>
            <li><strong>Statut :</strong> Entrepreneur Individuel (Auto-entrepreneur)</li>
            <li><strong>Adresse :</strong> 7 rue du pré de la ramée, 44550 Montoir De Bretagne</li>
            <li><strong>SIRET :</strong> 93044860000013</li>
            <li><strong>SIREN :</strong> 930448600</li>
            <li>
              <strong>E-mail :</strong>{" "}
              <Link href="mailto:gael_pro@ik.me" className="text-[#7158ff] hover:underline">
                gael_pro@ik.me
              </Link>
            </li>
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-[#7158ff]">
            2. Hébergement et Services
          </h2>
          <p className="mb-4">Le site et ses données sont propulsés par les prestataires suivants :</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Hébergement du site :</strong> Vercel Inc.<br />
              <span className="text-sm text-muted-foreground">440 N Barranca Ave #4133, Covina, CA 91723, USA. https://vercel.com</span>
            </li>
            <li>
              <strong>Gestion du domaine :</strong> Infomaniak Network SA<br />
              <span className="text-sm text-muted-foreground">Rue Eugène-Marziano 25, 1227 Genève, Suisse. https://www.infomaniak.com</span>
            </li>
            <li>
              <strong>Base de données :</strong> Supabase Inc.<br />
              <span className="text-sm text-muted-foreground">970 Summer St, Stamford, CT 06905, USA. https://supabase.com</span>
            </li>
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-[#7158ff]">
            3. Propriété intellectuelle
          </h2>
          <p>
            L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
          </p>
          <p className="mt-2">
            La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse de l'éditeur.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-[#7158ff]">
            4. Limitation de responsabilité
          </h2>
          <p>
            Gaël Richard s'efforce d'assurer l'exactitude des informations diffusées sur ce site. Toutefois, il ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition. L'utilisateur utilise le site à ses seuls risques.
          </p>
        </div>

        <time dateTime="2026-05-08" className="mt-12 block text-center text-sm text-muted-foreground">
          Dernière mise à jour : 08/05/2026
        </time>
      </div>
    </section>
  );
}
