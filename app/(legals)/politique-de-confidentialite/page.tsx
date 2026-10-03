import { LegalPage } from "@/components/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité | Gaël Richard",
  description: "Quelles données gael-dev.fr collecte, pourquoi, combien de temps, et vos droits.",
};

export default function PolitiqueConfidentialite() {
  return (
    <LegalPage
      kicker="confidentialité"
      title={
        <>
          Vos données, <span className="hl">sans surprise.</span>
        </>
      }
      intro="Ce que je collecte quand vous utilisez ce site, ce que j'en fais, et comment le faire supprimer. Le tout conformément au Règlement général sur la protection des données (RGPD)."
      updated="03/10/2026"
      sections={[
        {
          title: "Ce qui est collecté",
          body: (
            <>
              <p>Selon ce que vous faites sur le site :</p>
              <ul>
                <li>
                  <strong>Formulaire de contact :</strong> prénom, nom, e-mail, entreprise (facultatif),
                  type de projet, budget envisagé et votre message.
                </li>
                <li>
                  <strong>Espace client :</strong> la connexion passe par Google, qui me transmet votre
                  nom, votre adresse e-mail et votre photo de profil. Aucun mot de passe n'est stocké ici.
                </li>
                <li>
                  <strong>Avis et briefs :</strong> ce que vous saisissez dans les formulaires reçus par
                  lien personnel (témoignage, réponses au brief de projet).
                </li>
                <li>
                  <strong>Statistiques de visite :</strong> le site utilise Plausible, hébergé sur mon
                  propre serveur. Il compte les pages vues sans cookie et sans identifier les visiteurs.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Pourquoi",
          body: (
            <ul>
              <li>Répondre à vos demandes de contact et établir un devis.</li>
              <li>Suivre la relation avec mes clients : projets, devis, factures.</li>
              <li>Faire fonctionner l'espace client et les services que vous y avez activés.</li>
              <li>Afficher les avis que vous m'avez autorisé à publier.</li>
            </ul>
          ),
        },
        {
          title: "Combien de temps",
          body: (
            <ul>
              <li>
                <strong>Demandes de contact :</strong> trois ans après le dernier échange si aucun projet
                n'a suivi.
              </li>
              <li>
                <strong>Clients :</strong> pendant la durée de la relation, puis le temps imposé par les
                obligations comptables (dix ans pour les factures).
              </li>
              <li>
                <strong>Compte de l'espace client :</strong> jusqu'à sa suppression, que vous pouvez me
                demander à tout moment.
              </li>
            </ul>
          ),
        },
        {
          title: "Qui y a accès",
          body: (
            <>
              <p>
                Moi seul. Les données sont stockées sur un serveur loué chez Hostinger (Union
                européenne), avec des sauvegardes chiffrées. Les prestataires suivants interviennent
                techniquement, sans exploiter vos données pour leur compte :
              </p>
              <ul>
                <li><strong>Hostinger :</strong> hébergement du site et de la base de données.</li>
                <li><strong>Google :</strong> connexion à l'espace client.</li>
                <li><strong>Supabase :</strong> stockage des images.</li>
              </ul>
              <p>Aucune donnée n'est vendue ni transmise à des fins publicitaires.</p>
            </>
          ),
        },
        {
          title: "Vos droits",
          body: (
            <p>
              Vous pouvez demander l'accès, la rectification, la suppression de vos données ou vous
              opposer à leur traitement. Écrivez à{" "}
              <a href="mailto:hello@gael-dev.fr">hello@gael-dev.fr</a>, je réponds sous un mois. Vous pouvez
              aussi saisir la CNIL si vous estimez que vos droits ne sont pas respectés.
            </p>
          ),
        },
        {
          title: "Cookies",
          body: (
            <p>
              Le site ne dépose aucun cookie publicitaire ni de suivi. Seul l'espace client utilise un
              cookie de session, indispensable pour vous garder connecté. C'est pourquoi il n'y a pas de
              bandeau de consentement.
            </p>
          ),
        },
      ]}
    />
  );
}
