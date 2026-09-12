/**
 * Questions du formulaire de cadrage envoyé aux prospects.
 *
 * Écrites pour quelqu'un qui n'y connaît rien en sites web : pas de jargon,
 * des exemples concrets, et la possibilité de répondre « je ne sais pas »
 * partout. Un formulaire qui bloque est un formulaire abandonné.
 *
 * Ce fichier est la seule source de vérité : la page publique l'utilise pour
 * afficher les questions, et l'admin pour afficher les réponses. Ajouter une
 * question ici suffit, les réponses sont stockées en JSON.
 */

export type QuestionType = "text" | "long" | "choice" | "multi";

export interface BriefQuestion {
  /** Clé stockée dans le JSON des réponses. Ne jamais la renommer ensuite. */
  id: string;
  label: string;
  /** Précision affichée en petit sous la question. */
  hint?: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  /**
   * N'affiche la question que si une réponse précédente le justifie. Poser
   * « qu'est-ce qui ne vous convient pas sur votre site ? » à quelqu'un qui
   * n'a pas de site, c'est le meilleur moyen de le perdre.
   */
  showIf?: {
    question: string;
    equals?: string[];
    notEquals?: string[];
  };
}

export interface BriefSection {
  id: string;
  title: string;
  /** Phrase d'accueil de l'étape, pour rassurer plutôt qu'expliquer. */
  intro: string;
  questions: BriefQuestion[];
}

export const BRIEF_SECTIONS: BriefSection[] = [
  {
    id: "activite",
    title: "Votre activité",
    intro:
      "On commence par le plus simple : ce que vous faites. Répondez avec vos mots, comme si vous me l'expliquiez au téléphone.",
    questions: [
      {
        id: "metier",
        label: "Quelle est votre activité ?",
        hint: "Exemple : boulangerie artisanale, plombier, cabinet d'ostéopathie…",
        type: "text",
        placeholder: "Votre métier en quelques mots",
        required: true,
      },
      {
        id: "clientele",
        label: "À qui vous adressez-vous ?",
        hint: "Des particuliers, des entreprises, une région précise…",
        type: "long",
        placeholder:
          "Exemple : des particuliers autour de Saint-Nazaire, plutôt des familles",
      },
      {
        id: "differenciation",
        label: "Qu'est-ce qui vous distingue de vos concurrents ?",
        hint: "Ce que vos clients vous disent le plus souvent, par exemple.",
        type: "long",
        placeholder: "Ce dont vous êtes le plus fier dans votre travail",
      },
      {
        id: "anciennete",
        label: "Depuis combien de temps exercez-vous ?",
        type: "choice",
        options: [
          "Je démarre tout juste",
          "Moins de 2 ans",
          "Entre 2 et 10 ans",
          "Plus de 10 ans",
        ],
      },
    ],
  },
  {
    id: "projet",
    title: "Votre projet",
    intro:
      "Maintenant, ce que vous attendez de ce site. Il n'y a pas de mauvaise réponse.",
    questions: [
      {
        id: "objectif",
        label: "À quoi doit servir votre site, en priorité ?",
        hint: "Choisissez ce qui compte le plus pour vous.",
        type: "choice",
        options: [
          "Être trouvé sur internet, exister en ligne",
          "Recevoir des demandes de devis ou des appels",
          "Prendre des rendez-vous",
          "Vendre en ligne",
          "Présenter mon travail, mes réalisations",
          "Je ne sais pas encore",
        ],
        required: true,
      },
      {
        id: "objectif_detail",
        label:
          "Si vous deviez juger le site réussi dans un an, à quoi le verriez-vous ?",
        hint: "Exemple : « j'aurais deux ou trois demandes par semaine ».",
        type: "long",
        placeholder: "Ce que le site devrait vous apporter concrètement",
      },
      {
        id: "site_actuel",
        label: "Avez-vous déjà un site ou une page internet ?",
        type: "choice",
        options: [
          "Non, rien du tout",
          "Oui, un site que je veux refaire",
          "Seulement une page Facebook ou Instagram",
          "Une fiche Google (celle qui apparaît dans les recherches)",
        ],
      },
      {
        id: "site_actuel_url",
        label: "Quelle est son adresse ?",
        hint: "Le lien de votre site ou de votre page.",
        type: "text",
        showIf: { question: "site_actuel", notEquals: ["Non, rien du tout"] },
        placeholder: "exemple.fr ou le lien de votre page Facebook",
      },
      {
        id: "site_actuel_probleme",
        label: "Qu'est-ce qui ne vous convient pas aujourd'hui ?",
        type: "long",
        showIf: { question: "site_actuel", notEquals: ["Non, rien du tout"] },
        placeholder: "Ce qui vous dérange, même si c'est juste une impression",
      },
    ],
  },
  {
    id: "fonctionnalites",
    title: "Ce que le site doit faire",
    intro:
      "Cochez tout ce qui vous semble utile. On pourra très bien en retirer ensemble : cocher n'engage à rien et ne coûte rien pour l'instant.",
    questions: [
      {
        id: "fonctions",
        label: "De quoi auriez-vous besoin ?",
        type: "multi",
        options: [
          "Un formulaire pour me contacter",
          "Afficher mon téléphone et mon adresse",
          "Une carte pour me trouver",
          "Prendre rendez-vous en ligne",
          "Vendre des produits en ligne",
          "Une galerie de photos de mon travail",
          "Mes tarifs ou ma carte",
          "Les avis de mes clients",
          "Des actualités ou un blog",
          "Un lien vers mes réseaux sociaux",
          "Que mes clients puissent se connecter à un espace privé",
          "Le site en plusieurs langues",
        ],
      },
      {
        id: "fonctions_autres",
        label: "Autre chose en tête ?",
        hint: "Même une idée floue, écrivez-la.",
        type: "long",
        placeholder: "Tout ce qui manque dans la liste au-dessus",
      },
      {
        id: "modifier_soi_meme",
        label: "Souhaitez-vous pouvoir modifier le site vous-même ensuite ?",
        hint: "Changer un tarif, ajouter une photo, sans passer par moi.",
        type: "choice",
        options: [
          "Oui, c'est important",
          "Non, je préfère vous le demander",
          "Je ne sais pas",
        ],
      },
    ],
  },
  {
    id: "contenu",
    title: "Les textes et les photos",
    intro:
      "C'est souvent le point qui retarde le plus un projet. Autant en parler maintenant, et sans pression.",
    questions: [
      {
        id: "textes",
        label: "Qui écrira les textes du site ?",
        type: "choice",
        options: [
          "Je les ai déjà",
          "Je peux les écrire",
          "J'aimerais que vous m'aidiez",
          "Je ne sais pas",
        ],
      },
      {
        id: "photos",
        label: "Avez-vous des photos de votre activité ?",
        type: "choice",
        options: [
          "Oui, de bonnes photos",
          "Quelques-unes, prises au téléphone",
          "Non, aucune",
          "Je ne sais pas si elles conviennent",
        ],
      },
      {
        id: "logo",
        label: "Avez-vous un logo ?",
        type: "choice",
        options: [
          "Oui, avec le fichier d'origine",
          "Oui, mais je n'ai qu'une image de mauvaise qualité",
          "Non, pas encore",
        ],
      },
      {
        id: "nb_pages",
        label: "Combien de pages imaginez-vous ?",
        hint: "Une estimation suffit largement.",
        type: "choice",
        options: [
          "Une seule page qui dit tout",
          "3 à 5 pages",
          "6 à 10 pages",
          "Plus de 10 pages",
          "Aucune idée",
        ],
      },
    ],
  },
  {
    id: "style",
    title: "Le style",
    intro:
      "Pour que le résultat vous ressemble plutôt qu'il ne ressemble à moi.",
    questions: [
      {
        id: "sites_aimes",
        label: "Des sites que vous trouvez réussis ?",
        hint: "Dans n'importe quel domaine, même très loin du vôtre. C'est le plus utile de tout le questionnaire.",
        type: "long",
        placeholder:
          "Collez les adresses, une par ligne, et dites ce qui vous plaît",
      },
      {
        id: "sites_detestes",
        label: "Au contraire, des sites que vous trouvez ratés ?",
        type: "long",
        placeholder: "Savoir ce que vous ne voulez pas m'aide autant",
      },
      {
        id: "ambiance",
        label: "Quelle impression le site doit-il donner ?",
        type: "multi",
        options: [
          "Sérieux, rassurant",
          "Chaleureux, familial",
          "Moderne, épuré",
          "Artisanal, authentique",
          "Haut de gamme",
          "Dynamique, coloré",
        ],
      },
      {
        id: "couleurs",
        label: "Des couleurs imposées ?",
        hint: "Celles de votre logo, de votre enseigne, de votre camion…",
        type: "text",
        placeholder: "Exemple : le bleu de mon enseigne, sinon carte blanche",
      },
    ],
  },
  {
    id: "pratique",
    title: "Budget et délai",
    intro:
      "Dernière étape. Ces réponses me servent à vous proposer quelque chose de réaliste, pas à gonfler le devis.",
    questions: [
      {
        id: "budget",
        label: "Quel budget avez-vous en tête ?",
        hint: "Une fourchette, même large. Je m'y adapte plutôt que l'inverse.",
        type: "choice",
        options: [
          "Moins de 500 €",
          "500 € à 1 500 €",
          "1 500 € à 3 000 €",
          "3 000 € à 5 000 €",
          "Plus de 5 000 €",
          "Je n'en ai aucune idée",
        ],
        required: true,
      },
      {
        id: "delai",
        label: "Pour quand aimeriez-vous que ce soit en ligne ?",
        type: "choice",
        options: [
          "Le plus vite possible",
          "Dans le mois",
          "Dans les trois mois",
          "Pas de date précise",
          "J'ai une date imposée",
        ],
      },
      {
        id: "delai_detail",
        label: "Quelle est cette date, et pourquoi ?",
        hint: "Une ouverture, un salon, une saison…",
        type: "text",
        showIf: { question: "delai", equals: ["J'ai une date imposée"] },
        placeholder: "Exemple : avant l'ouverture de la boutique le 15 mars",
      },
      {
        id: "nom_domaine",
        label: "Avez-vous déjà une adresse internet réservée ?",
        hint: "Le « monentreprise.fr ». Si vous ne savez pas, répondez « je ne sais pas », c'est très courant.",
        type: "choice",
        options: ["Oui, je l'ai réservée", "Non, pas encore", "Je ne sais pas"],
      },
      {
        id: "contact_prefere",
        label: "Comment préférez-vous qu'on échange ?",
        type: "choice",
        options: [
          "Par téléphone",
          "Par email",
          "En visio",
          "En personne si c'est possible",
        ],
      },
      {
        id: "libre",
        label: "Quelque chose à ajouter ?",
        hint: "Une inquiétude, une contrainte, une question. Cet espace est à vous.",
        type: "long",
        placeholder: "Tout ce que vous voulez me dire",
      },
    ],
  },
];

/** Toutes les questions à plat, pour l'affichage des réponses côté admin. */
export const BRIEF_QUESTIONS: BriefQuestion[] = BRIEF_SECTIONS.flatMap(
  (section) => section.questions,
);

export function findQuestion(id: string): BriefQuestion | undefined {
  return BRIEF_QUESTIONS.find((question) => question.id === id);
}

/** Une question conditionnelle ne s'affiche que si sa condition est remplie. */
export function isVisible(
  question: BriefQuestion,
  answers: Record<string, string | string[] | undefined>,
): boolean {
  const condition = question.showIf;
  if (!condition) return true;

  const raw = answers[condition.question];
  const value = Array.isArray(raw) ? raw.join(", ") : (raw ?? "");

  // Tant que la question dont on dépend n'a pas de réponse, on n'affiche rien :
  // mieux vaut une question en moins qu'une question hors sujet.
  if (!value) return false;
  if (condition.equals) return condition.equals.includes(value);
  if (condition.notEquals) return !condition.notEquals.includes(value);
  return true;
}
