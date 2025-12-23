# =============================================================================
# Dockerfile Backend - Multi-stage, Multi-arch (AMD64/ARM64)
# Targets: development, production
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base - Image de base commune
# -----------------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM node:20-alpine AS base

# Métadonnées
LABEL maintainer="PokeBoutique Team"
LABEL description="Backend API for PokeBoutique - Pokemon Cards E-commerce"

# Installation des dépendances système nécessaires
RUN apk add --no-cache dumb-init

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# -----------------------------------------------------------------------------
# Stage 2: Dependencies - Installation des dépendances
# -----------------------------------------------------------------------------
FROM base AS deps

# Copie des fichiers de dépendances pour optimiser le cache
COPY package.json package-lock.json* ./

# Installation de toutes les dépendances (dev incluses pour le build)
RUN npm ci

# -----------------------------------------------------------------------------
# Stage 3: Development - Target pour le développement local
# -----------------------------------------------------------------------------
FROM base AS development

# Variables d'environnement pour le développement
ENV NODE_ENV=development
ENV PORT=5000

WORKDIR /app

# Copie des dépendances depuis le stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copie du code source (sera écrasé par le volume en dev)
COPY --chown=nodejs:nodejs . .

# Changement vers l'utilisateur non-root
USER nodejs

# Exposition du port
EXPOSE 5000

# Healthcheck pour vérifier que l'API répond
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Commande de démarrage avec nodemon pour le hot-reload
CMD ["dumb-init", "npm", "run", "dev"]

# -----------------------------------------------------------------------------
# Stage 4: Build - Préparation pour la production
# -----------------------------------------------------------------------------
FROM base AS build

WORKDIR /app

# Copie des dépendances
COPY --from=deps /app/node_modules ./node_modules

# Copie du code source
COPY . .

# Installation uniquement des dépendances de production
RUN npm ci --only=production && npm cache clean --force

# -----------------------------------------------------------------------------
# Stage 5: Production - Image finale optimisée
# -----------------------------------------------------------------------------
FROM base AS production

# Variables d'environnement pour la production
ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

# Copie uniquement des fichiers nécessaires depuis le stage build
COPY --from=build --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/src ./src
COPY --from=build --chown=nodejs:nodejs /app/package.json ./

# Changement vers l'utilisateur non-root
USER nodejs

# Exposition du port
EXPOSE 5000

# Healthcheck pour vérifier que l'API répond
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Commande de démarrage avec dumb-init pour une gestion propre des signaux
CMD ["dumb-init", "node", "src/server.js"]
