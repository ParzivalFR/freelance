# Récapitulatif de la Migration et Mise en Conformité - 08/05/2026

Ce document résume les changements effectués lors de la session de mise en conformité légale et de migration du domaine.

## 1. Changements Légaux & Conformité
- **Mentions Légales :** 
    - Création de la page `/mentions-legales`.
    - Mise à jour de l'identité de l'éditeur (Gaël Richard).
    - Mise à jour des prestataires techniques : **Vercel** (Hébergement), **Infomaniak** (Domaine), **Supabase** (Base de données).
    - Suppression du numéro de téléphone (à la demande de l'utilisateur).
- **Politique de Confidentialité :**
    - Création d'une page dédiée `/politique-de-confidentialite` pour la conformité RGPD.
    - Explication de la collecte des données via le formulaire de contact.
- **Typographie :** 
    - Retrait des accents sur les titres `H1` en majuscules pour éviter les bugs d'affichage de la police *Black Han Sans*.

## 2. Migration du Domaine
- **Passage en Français :**
    - `/privacy` -> `/politique-de-confidentialite`
    - `/terms` -> `/mentions-legales`
- **Mise à jour du code :**
    - Remplacement de `freelance.gael-dev.fr` par `gael-dev.fr` dans :
        - `app/layout.tsx` (Métadonnées & Plausible Script)
        - `lib/plausible.ts` (Site ID)
        - `public/robots.txt` (Host & Sitemap)
        - `app/api/admin/testimonial-tokens/` (URLs de redirection et emails)
- **Footer :** Mise à jour des liens du `SiteFooter` vers les nouvelles routes françaises.

## 3. Correctifs UI
- Restauration des arrondis `rounded-xl` sur les composants `Button` et `Input` qui avaient été accidentellement modifiés.

## 4. Actions manuelles restantes (Checklist)
Pour finaliser la migration, les étapes suivantes doivent être effectuées sur les plateformes externes :

- [ ] **Vercel/Environnement :** Mettre à jour `NEXTAUTH_URL` et `SITE_URL` vers `https://gael-dev.fr`.
- [ ] **Stripe :** Modifier l'URL du Webhook vers `https://gael-dev.fr/api/webhooks`.
- [ ] **Plausible :** Changer le domaine du site dans le dashboard Plausible vers `gael-dev.fr`.
- [ ] **Auth (Google/GitHub) :** Mettre à jour les URIs de redirection autorisés si l'authentification est utilisée.

---
*Document généré par Gemini CLI pour Gaël Richard.*
