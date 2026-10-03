import { LegalPage } from "@/components/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales | Gaël Richard",
  description: "Éditeur, hébergement et propriété intellectuelle du site gael-dev.fr.",
};

export default function MentionsLegales() {
  return (
    <LegalPage
      kicker="mentions légales"
      title={
        <>
          Qui est derrière <span className="hl">ce site.</span>
        </>
      }
      intro="Les informations que la loi demande d'afficher : qui édite le site, qui l'héberge, et ce que vous pouvez en faire."
      updated="03/10/2026"
      sections={[
        {
          title: "Éditeur du site",
          body: (
            <>
              <p>
                En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans
                l'économie numérique, voici l'identité de l'éditeur de ce site :
              </p>
              <ul>
                <li><strong>Nom :</strong> Gaël Richard</li>
                <li><strong>Statut :</strong> entrepreneur individuel</li>
                <li><strong>Adresse :</strong> 7 rue du pré de la ramée, 44550 Montoir-de-Bretagne</li>
                <li><strong>SIRET :</strong> 930 448 600 00013</li>
                <li><strong>SIREN :</strong> 930 448 600</li>
                <li>
                  <strong>E-mail :</strong> <a href="mailto:hello@gael-dev.fr">hello@gael-dev.fr</a>
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Hébergement et services",
          body: (
            <>
              <p>Le site et ses données reposent sur les prestataires suivants :</p>
              <ul>
                <li>
                  <strong>Hébergement du site et de sa base de données :</strong> Hostinger International Ltd,
                  61 Lordou Vironos Street, 6023 Larnaca, Chypre. hostinger.fr
                </li>
                <li>
                  <strong>Nom de domaine :</strong> Infomaniak Network SA, rue Eugène-Marziano 25,
                  1227 Genève, Suisse. infomaniak.com
                </li>
                <li>
                  <strong>Stockage des images :</strong> Supabase Inc., 970 Summer St, Stamford,
                  CT 06905, États-Unis. supabase.com
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Propriété intellectuelle",
          body: (
            <>
              <p>
                L'ensemble de ce site relève de la législation française et internationale sur le
                droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont
                réservés, y compris pour les documents téléchargeables et les images.
              </p>
              <p>
                La reproduction de tout ou partie de ce site, sur quelque support que ce soit, est
                interdite sans l'autorisation écrite de l'éditeur. Les captures des projets présentés
                restent la propriété de leurs clients respectifs.
              </p>
            </>
          ),
        },
        {
          title: "Responsabilité",
          body: (
            <p>
              Gaël Richard s'efforce d'assurer l'exactitude des informations publiées sur ce site, sans
              pouvoir en garantir l'exhaustivité. Les liens vers des sites tiers sont fournis à titre
              indicatif ; leur contenu n'engage pas l'éditeur.
            </p>
          ),
        },
      ]}
    />
  );
}
