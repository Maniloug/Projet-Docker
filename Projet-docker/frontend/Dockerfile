# =============================================================================
# Dockerfile Frontend - Multi-stage, Multi-arch (AMD64/ARM64)
# Targets: development, production
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base - Image de base commune
# -----------------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM node:20-alpine AS base

# Métadonnées
LABEL maintainer="PokeBoutique Team"
LABEL description="Frontend React for PokeBoutique - Pokemon Cards E-commerce"

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

# Installation de toutes les dépendances
RUN npm ci

# -----------------------------------------------------------------------------
# Stage 3: Development - Target pour le développement local
# -----------------------------------------------------------------------------
FROM base AS development

# Variables d'environnement pour le développement
ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=5173

WORKDIR /app

# Copie des dépendances depuis le stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copie du code source (sera écrasé par le volume en dev)
COPY --chown=nodejs:nodejs . .

# Changement vers l'utilisateur non-root
USER nodejs

# Exposition du port Vite
EXPOSE 5173

# Healthcheck pour vérifier que Vite répond
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5173 || exit 1

# Commande de démarrage avec Vite en mode dev
CMD ["dumb-init", "npm", "run", "dev", "--", "--host", "0.0.0.0"]

# -----------------------------------------------------------------------------
# Stage 4: Build - Construction des assets statiques
# -----------------------------------------------------------------------------
FROM base AS build

WORKDIR /app

# Copie des dépendances
COPY --from=deps /app/node_modules ./node_modules

# Copie du code source
COPY . .

# Build de l'application React
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 5: Production - Serveur Nginx pour les fichiers statiques
# -----------------------------------------------------------------------------
FROM nginx:alpine AS production

# Métadonnées
LABEL maintainer="PokeBoutique Team"
LABEL description="Frontend React for PokeBoutique - Production"

# Création d'un utilisateur non-root
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 -G nginx-user

# Installation de wget pour le healthcheck
RUN apk add --no-cache wget

# Copie de la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copie des fichiers buildés depuis le stage build
COPY --from=build /app/dist /usr/share/nginx/html

# Création des répertoires nécessaires avec les bonnes permissions
RUN mkdir -p /var/cache/nginx /var/run && \
    chown -R nginx-user:nginx-user /var/cache/nginx /var/run /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Changement vers l'utilisateur non-root
USER nginx-user

# Exposition du port
EXPOSE 8080

# Healthcheck pour vérifier que Nginx répond
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080 || exit 1

# Commande de démarrage Nginx
CMD ["nginx", "-g", "daemon off;"]
