# gael-dev.fr : état des lieux et règles de travail (octobre 2026)

Document de passation. Il résume tout ce qui a été décidé, fait et appris
sur `freelance` (gael-dev.fr) et `bot-engine` entre septembre et octobre 2026,
pour que n'importe qui (humain ou IA) reprenne le travail sans refaire les
mêmes erreurs. Les règles de code du dépôt sont dans `CLAUDE.md` ; ce fichier
est le contexte autour.

## 1. Qui, quoi, où

- **Gaël Richard**, développeur freelance, entrepreneur individuel
  (Montoir-de-Bretagne, 44). Tutoiement, français, direct. Il tranche vite et
  dit franchement quand ça ne va pas : une proposition rejetée doit être
  abandonnée, pas reproposée sous une autre forme.
- **Dépôts** : `freelance` (site Next.js 16, Prisma 7, Postgres, dashboard
  client et admin) et `bot-engine` (worker discord.js, un process par bot,
  superviseur `scripts/worker.ts`). Les deux partagent la même base de
  données ; `freelance/prisma/schema.prisma` est le seul maître du schéma.
- **Contact public** : `hello@gael-dev.fr` partout sur le site (mentions
  légales, confidentialité, avis, brief). L'ancienne `gael_pro@ik.me` ne doit
  plus apparaître.

## 2. Infrastructure (depuis le 25/09/2026)

- Tout tourne sur le **VPS Hostinger `69.62.106.221`**, panel Dokploy
  `dokploy.gael-dev.fr` : services `freelance` (compose
  `docker-compose.dokploy.yml`), `bot-engine`, `freelance-db` (Postgres **18**,
  hôte interne `freelance-freelancedb-nzditm:5432`, base/utilisateur
  `freelance`, aucun port externe). Les deux compose déclarent
  `dokploy-network` en `external: true`.
- **Autodeploy** : fonctionne sur `freelance` (un push sur `main` déploie),
  **pas** sur `bot-engine` (bouton Deploy à la main).
- **Migrations** : le compose du site a un service `migrate` (stage
  `migrator` du Dockerfile) qui lance `prisma migrate deploy` avant `web`.
  Flux : modifier `schema.prisma` → migration en local contre la base Docker
  `freelance-db-dev` (port 5456) → commit du dossier `prisma/migrations` →
  push. Jamais de SQL manuel en prod, jamais `migrate dev`, `db push` ni
  `migrate reset` ailleurs que sur localhost. Si `migrate dev` refuse à cause
  d'un checksum (fins de ligne), écrire le fichier de migration à la main et
  l'appliquer avec `migrate deploy`.
- **Sauvegardes** : Dokploy sauvegarde `freelance-db` vers Cloudflare R2
  (bucket privé `gael-dev-backups`, destination `r2-backups`) ; les fichiers
  sont des `pg_dump` custom gzippés (`gzip -dc | pg_restore --no-owner
  --no-acl`, image postgres:18). Restauration testée. Gaël seul détient les
  clés R2. Copies locales dans `C:\Users\Gaelr\Backups\freelance\`.
- **Variables inscrites au build** (`NEXTAUTH_URL`, `AUTH_URL`, `SITE_URL`,
  `NEXT_PUBLIC_APP_URL`) : les changer impose un redéploiement complet.
  `SITE_URL` vérifiée à `https://gael-dev.fr` dans Dokploy le 03/10.
- **Pièges Dokploy/Traefik** : si Let's Encrypt échoue une fois, Traefik ne
  retente pas → Web Server → Traefik → Reload. Tester un serveur avant
  bascule DNS avec `curl --resolve hote:443:IP`. L'image Postgres par défaut
  de Dokploy est la 18 (chemin `/var/lib/postgresql/18/docker`).
- **Ce qui reste ailleurs et ne doit pas être supprimé** : la base Supabase
  d'origine (figée au 19/09, jamais y toucher), le projet Vercel (ancien
  hébergement, gardé en secours), le stockage Supabase qui héberge encore les
  images des projets et des témoignages. HiveCloud (`45.145.164.29`) est
  éteint depuis le 30/09.
- **Statistiques** : Plausible auto-hébergé (`plausible.gael-dev.fr`), sans
  cookie ; c'est ce qui justifie l'absence de bandeau sur le site.

## 3. Identité visuelle (validée le 02/10/2026, après dix essais)

- **Palette** : fond perle `#F5F4F1`, encre `#1E1F24`, gris `#696A70`,
  filets `#E3E2DE`, galet `#ECEBE7` (cartes de projets), une seule couleur :
  **kaki** `#4A5A3A` et sa version claire `#DADFCF`. En mode sombre du
  dashboard, le kaki devient `#9DB38A`. Le jeton Tailwind s'appelle `brand`
  (`--color-brand` dans `app/globals.css`). Plus aucun violet `#7158ff`.
- **Typographie** : Bricolage Grotesque (titres), Instrument Sans (texte),
  JetBrains Mono (étiquettes). Chargées dans `app/layout.tsx`
  (`--font-bricolage`, `--font-instrument`, `--font-jetbrains`). Les anciennes
  (Black Han Sans, Caveat, DM Sans, Playfair) sont retirées.
- **Signes récurrents** : un mot posé sur une pastille (`.hl`), des
  étiquettes façon commentaire de code (`.note note-comment` → `// devis
  gratuit`), des captures de projets dans un cadre de navigateur
  (`BrowserShot`). Aucun mouvement au survol (pas de translate ni de scale),
  seulement un changement de teinte : Gaël trouve les boutons qui « sautent »
  cheap.
- **Logo** : le « G-cadre avec un petit r kaki », composant
  `components/logo.tsx`, fichier `public/gr-logo.svg`, icônes générées par
  `app/icon.tsx` et `app/apple-icon.tsx`, `app/favicon.ico`, image de partage
  `public/og.png`. Pack complet (SVG, icônes, bannières 1584×396, logo avec
  nom) dans `Developpement/identite-gael-dev/`.
- **Thème** : les pages publiques sont **toujours claires** via la classe
  `.landing` (qui redéfinit les `--color-*` de shadcn). Le dashboard et
  l'admin gardent le bouton clair/sombre.
- **Ce que Gaël a rejeté** (ne pas reproposer) : bleu + jaune « artisan »,
  sa photo en grand, sombre monochrome plat (« trop IA »), vert sapin, bleu
  pétrole, lavande (« pas assez masculin »), une landing classique type SaaS
  (grilles de tarifs, blocs fonctionnalités, FAQ), des concepts gadgets (site
  généré en direct, chat, bureau), un héros sombre à halo, la copie conforme
  de Fleetly, des cartes multicolores pastel, des logos qui ne sont que des
  lettres tapées dans une police. Ce qu'il voulait : « un site qui me
  ressemble, sobre, pastel, propre, pas Monsieur tout le monde, qui montre ce
  que je fais et donne envie ». Références qu'il aime : beee.agency,
  maxmhx.com, ov7.fr, yelloworld.dev.
- **Vouvoiement** côté clients, première personne côté Gaël.

## 4. Les pages, et comment elles marchent

- **Accueil** (`app/(marketing)/page.tsx`, `force-dynamic`) : héros avec trois
  captures en 3D (`components/landing/hero-fan.tsx`, Framer Motion), projets,
  services (quatre lignes écrites en dur dans la page : 350 €, 800 €, sur
  devis), à propos (photo en petit rond), avis en carrousel, contact. Projets
  et avis sont lus en base côté serveur.
- **Projets** : tri `featured desc, offline asc, order asc`. Le premier
  projet `featured` a la grande carte ; cinq affichés, le reste derrière
  « Voir tous les projets ». Champs ajoutés en octobre : `label` (libellé
  libre affiché au-dessus du titre) et `offline` (« plus en ligne » : carte
  sans lien, grisée, classée en dernier, exclue du héros). L'URL est
  facultative : sans adresse, la carte affiche `lien privé` et n'est pas
  cliquable. Le cadre de navigateur est ajouté par le site : envoyer des
  captures brutes depuis l'admin. Captures propres prêtes dans
  `Developpement/captures-gael-dev/`.
- **Avis** : `/api/testimonials` et le formulaire par lien
  (`/testimonial/<token>`). Plus d'upload de photo (les anciennes étaient
  stockées en base64 dans `imgUrl`, jusqu'à 600 Ko). Un avis est en ligne dès
  l'envoi, il n'y a pas de modération.
- **Brief client** (`/brief/<token>`) : questionnaire étape par étape,
  réponses sauvegardées dans le navigateur, recoloré sans changer la logique.
- **Statut d'un bot** (`/status/<botId>`) : lit `lib/public-status.ts`,
  partagé avec `/api/public/status/<botId>`. Ne plus jamais faire appeler sa
  propre API par HTTP depuis une page (c'était le cas et ça renvoyait 500 en
  local).
- **Connexion** (`/signin`) : Google uniquement, le compte se crée à la
  première connexion ; `/signup` redirige. Après connexion : `/espaces`
  (choix admin / client ; un client est redirigé d'office vers
  `/dashboard/bot`). Le lien « Mon espace » du menu mène à `/espaces`.
- **Mentions légales et confidentialité** : gabarit `components/legal-page.tsx`.
  Contenu à jour au 03/10 (Hostinger, Google, Plausible, durées de
  conservation). À confirmer : le registrar du domaine est bien Infomaniak.
- **404** : `app/not-found.tsx`, en français, dans la DA.
- **SEO** : titre « Gaël Richard · Développeur freelance », description et
  image de partage dans `app/layout.tsx` ; `next-sitemap.config.js` tombe sur
  `https://gael-dev.fr` si `SITE_URL` manque.
- **Générateur de bots Discord** : volontairement retiré de l'accueil (Gaël
  pense l'arrêter). Le dashboard et bot-engine continuent de tourner pour les
  clients existants ; un client payant (Copilote, bot de Fleetly) est en PRO.

- **E-mails** (refaits le 05/10) : tous passent par `lib/email-layout.ts`
  (`emailLayout`, `emailHighlight`, `emailNote`, `emailButton`, `emailRows`,
  `emailQuote`) : fond perle, carte blanche, logo `public/logo-email.png`
  chargé depuis le site, étiquette `// …`, bouton pilule, pied de page
  `hello@gael-dev.fr`. Concernés : contact (notification + accusé, `app/api/
  contact/route.ts`), brief (invitation `lib/brief-mail.ts`, notification +
  accusé `app/api/brief/[token]/route.ts`), demande d'avis
  (`lib/email-templates/testimonial-request.ts`), envoi de devis
  (`lib/email.ts`). Les modèles sont dans le code, pas en base : la page admin
  « Email templates » ne fait que les lister. Deux transports SMTP
  coexistent : `lib/mailer.ts` (`EMAIL_*`, Infomaniak) pour contact, brief et
  avis ; `lib/email.ts` (`SMTP_*`) pour les devis. Tout nouvel e-mail doit
  utiliser `emailLayout`, pas de HTML maison. Pas d'émoji dans les objets.
- **PDF de devis** (`lib/pdf-generator.ts`, jsPDF, même signature
  `generateDevisPDF`) : logo via `lib/pdf-logo.ts` (PNG base64), en-tête
  « DEVIS » avec étiquette numéro/date, émetteur/destinataire, encart
  validité/règlement/TVA (« non applicable (art. 293 B du CGI) » en
  franchise), tableau à en-tête noir, bloc total, notes, cadre « Bon pour
  accord », pied de page avec SIRET et numéro de page. Helvetica seulement :
  les montants retirent l'espace fine insécable d'Intl, sinon elle sort en
  « / ». Exemple dans `Developpement/identite-gael-dev/exemple-devis.pdf`.
  Pour prévisualiser hors de l'app : compiler le fichier avec `tsc
  --ignoreConfig`, l'exécuter avec `NODE_PATH=node_modules node`, rendre le
  PDF avec pdf.js dans Chrome headless (pas de `pdftoppm` sur le poste).

## 5. bot-engine, ce qu'il faut savoir

- Un process par bot, superviseur avec protection contre les boucles de
  redémarrage (`STABLE_UPTIME_MS` 10 min, `CRASH_LOOP_COOLDOWN_MS` 30 min).
- `allowedMentions` est réglé **par envoi**, jamais globalement (un `parse:
  []` global casserait les mentions voulues).
- Les clés du JSON de config d'un module doivent être identiques entre le
  dashboard (`components/dashboard/bot-types.ts`) et le module bot-engine.
- Toute action sensible (sous-commande, bouton, select, modal) a un contrôle
  de permission à l'exécution : Discord ignore `default_member_permissions`
  sur les sous-commandes.
- Option « image en haut » des panels tickets et vérification
  (`panelImageTop`, `verificationImageTop`) livrée fin septembre.
- Pour passer un bot en PRO à la main : SQL `update discord_bots set
  plan='PRO', paid_at=now(), worker_command='START' where id=…` dans le
  terminal Dokploy de `freelance-db`.
- Pas de `.dockerignore` : ne pas en ajouter un qui exclurait `.env` sans
  d'abord déclarer les variables dans le compose.

## 6. Règles de collaboration (données par Gaël, toujours en vigueur)

1. **Une question n'est pas un go.** « On peut faire X ? » appelle une
   réponse, pas un commit. Attendre un feu vert explicite avant de créer,
   modifier ou committer.
2. **Jamais de connexion SSH à un VPS sans demander.** Les actions sur Dokploy
   sont faites par Gaël, à qui on donne la marche à suivre.
3. **Ne jamais supprimer** la base Supabase, le projet Vercel, ni rien chez un
   ancien hébergeur : on copie, on arrête, on ne supprime pas.
4. **Les bots sont ceux des clients** : aucune action destructive sur une
   application Discord sans l'accord du client concerné.
5. **Commits sans aucune mention d'IA** (pas de `Co-Authored-By`), messages
   conventionnels en français, jamais `--no-verify`. `pnpm tsc --noEmit` avant
   chaque commit ; `pnpm build` avant de pousser quand l'admin ou les routes
   serveur sont touchés (tsc ne voit pas tout).
6. **Push** : seulement quand Gaël le demande ; sinon commit local et lui
   donner la commande.
7. **Ne corriger que ce dont on est certain** lors d'un audit ; lister le
   reste.
8. **Jamais afficher de secrets** (URL de base, clés, jetons) : les lire dans
   `.env` vers des variables, Gaël colle lui-même ses secrets dans Dokploy ou
   Cloudflare.
9. **Textes destinés à un client** : son registre à lui, phrases courtes, pas
   de point-virgule, pas de tiret cadratin, rien qui sente le texte d'IA.
10. **Design** : réutiliser les jetons de la charte, jamais de couleurs
    génériques ; pas d'icône seule dans un carré blanc flottant (« fait IA »).
11. **Vérifier avant d'affirmer** : pas de version d'image ou de procédure
    d'outil donnée de mémoire ; un rendu se contrôle à l'écran (Chrome
    headless ou navigateur piloté) et on dit ce qui n'a pas été vérifié.

## 7. Ce qui reste à faire (au 04/10/2026)

- **Dans l'admin** : remplacer les captures des projets (dossier
  `captures-gael-dev`), remplir les libellés, cocher « plus en ligne » sur
  Les Cnédiens (domaine détourné vers un casino), Kitilib (domaine mort),
  Aetius Protectum (ne répond plus) ou les dépublier ; remonter Jazz en Barque
  et l'Astronomie dans l'ordre.
- Vérifier que la boîte `hello@gael-dev.fr` existe et arrive chez Gaël.
- Contrôler l'admin et le dashboard **en mode sombre** (kaki éclairci jamais
  vu à l'écran).
- Mettre les bannières et l'avatar du pack sur LinkedIn, Malt, GitHub,
  Discord. Forcer le rafraîchissement de la carte Discord avec `?v=2`.
- E-mails et PDF de devis : refaits le 05/10 (`lib/email-layout.ts`, `lib/pdf-generator.ts`,
  logo `public/logo-email.png` et `lib/pdf-logo.ts`). Les modèles d'e-mails sont dans
  le code, pas en base : la page admin « Email templates » ne fait que les lister.
- Rapatrier les images des projets hors du stockage Supabase (optionnel).
- Audit de septembre, lots non traités : garde SSRF (modules monitor et
  welcome), Stripe (événements webhook, double abonnement, remboursement),
  plan ZIP non téléchargeable, écrasement du JSON de config par le dashboard,
  `logChannelId` partagé, permissions sur boutons tickets et aibuild, courses
  dans l'économie, `event_locks` partout, `.dockerignore` et limites mémoire de
  bot-engine, montée Node 22 et dépendances, `partials`, TZ.
- Landing : le pied de page n'appelle plus `/api/admin/settings` (qui
  renvoyait 401 aux visiteurs), les liens sociaux sont écrits en dur dans
  `components/site-footer.tsx`.

## 8. Historique des commits de la refonte (branche `main`)

`c01734d` accueil et libellé → `40d117f` survols sans mouvement → `2e8f260`
logo et kaki → `5404e99` carrousel → `4881be2` menu flottant → `1ab7437`
héros 3D → `22a5338` connexion → `9e79eb3` légales et 404 → `4a18f4d` avis,
brief, statut → `717f788` hello@ → `ae70c3f` admin et dashboard → `fdbacb9`
plan de site → `f6e9d2b` favicon → `e169bff` image de partage → `a330f96` Mon
espace → `c0d74fc` « plus en ligne » → `7fdc342` URL facultative → `dabed07` e-mails et PDF.
