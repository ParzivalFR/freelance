# Règles du projet

## Commits

- **Aucune référence à l'IA** : pas de `Co-Authored-By: Claude`, pas de mention d'IA dans les messages de commit
- Messages en français ou en anglais, concis, style conventionnel (`feat:`, `fix:`, `chore:`, etc.)
- Ne jamais utiliser `--no-verify`

## Code

- Ne pas over-engineer : pas de helpers, abstractions ou feature flags inutiles
- Pas de commentaires évidents — seulement si la logique n'est pas auto-explicite
- Pas de `console.log` de debug laissés en place
- Toujours lire un fichier avant de le modifier
- Tailwind v4 : utiliser `@utility` avec les longhands CSS pour les animations (pas `animation: var(--animate-xxx)` qui casse sur iOS Safari)

## Prisma & Migrations

- **Ne JAMAIS modifier un fichier dans `prisma/migrations/`** qui a déjà été appliqué en base — cela corrompt l'historique Prisma
- Pour tout changement de schéma → toujours créer une **nouvelle** migration : `pnpm prisma migrate dev --name description_du_changement`
- Pour du dev rapide sans créer de fichier migration → `pnpm prisma db push`
- Si une migration a été modifiée par erreur après application → la résoudre sans toucher aux données : `pnpm prisma migrate resolve --applied <nom_migration>`, puis créer une nouvelle migration
- Après tout changement de schéma → régénérer le client : `pnpm prisma generate`
- Ne jamais lancer `prisma migrate reset` sur la base de prod Supabase — cela supprime toutes les données

## Ajout d'un nouveau module bot

Quand on ajoute un nouveau module au bot, **trois endroits doivent toujours être mis à jour en même temps** :

1. **Sidebar** (`components/dashboard/bot-sidebar.tsx`)
   - Ajouter le lien vers la page dédiée dans la section `"Modules"` de `buildNav()`
   - Importer l'icône Lucide correspondante

2. **Page dédiée** (`app/(dashboard)/dashboard/bot/[botId]/<nom-module>/page.tsx`)
   - Si le module a des données en DB (ex : infractions, leaderboard) → page de gestion des données
   - Si le module est config-only (ex : welcome, tickets, logs) → page de config avec `useBotConfig` + bouton save

3. **Page Modules** (`app/(dashboard)/dashboard/bot/[botId]/modules/page.tsx`)
   - Ajouter un `<ModuleToggle>` pour activer/désactiver le module
   - Ajouter les champs de config de base (résumé compact)

### Checklist nouveau module

- [ ] `bot-sidebar.tsx` — lien + icône dans section "Modules"
- [ ] `[botId]/<module>/page.tsx` — page dédiée créée
- [ ] `modules/page.tsx` — `<ModuleToggle>` ajouté
- [ ] `bot-types.ts` — champs de config ajoutés au type `ModuleConfig`
- [ ] Schéma Prisma mis à jour si nouvelles tables nécessaires (`bot-engine/prisma/schema.prisma`)
- [ ] Route API créée si le module expose des données (`app/api/bot/<module>/route.ts`)
