FROM node:20-slim AS base
# pnpm figé : non épinglé, chaque build tirerait la dernière version publiée
# (c'est ce qui a cassé le déploiement de bot-engine avec pnpm 11).
RUN npm install -g pnpm@10.33.2
WORKDIR /app

# ── Dépendances ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ── Build ────────────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Inscrites dans le code au moment du build : les définir seulement à
# l'exécution les laisserait vides dans le navigateur. SITE_URL est lue par
# next-sitemap, qui l'écrit dans robots.txt et le sitemap.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_SOCKET_SECRET
ARG SITE_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL \
    NEXT_PUBLIC_SOCKET_SECRET=$NEXT_PUBLIC_SOCKET_SECRET \
    SITE_URL=$SITE_URL \
    NEXT_TELEMETRY_DISABLED=1

# prisma.config.ts exige DIRECT_URL même pour `generate`, qui ne se connecte
# pourtant jamais à la base : une valeur factice suffit pour cette étape.
RUN DIRECT_URL="postgresql://build:build@localhost:5432/build" pnpm build

# ── Exécution ────────────────────────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app
# HOSTNAME=0.0.0.0 : sans ça, le serveur autonome n'écoute que sur l'IP interne
# du conteneur et Traefik ne peut pas le joindre (piège déjà vu sur Mooveyes).
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# public/ est copié après le build : next-pwa et next-sitemap y écrivent
# sw.js, workbox et le sitemap pendant `pnpm build`.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
