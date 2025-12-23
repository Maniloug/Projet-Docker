# PokeBoutique - Projet Docker/Conteneurisation

Application e-commerce de cartes Pokemon conteneurisee avec Docker. Ce projet demontre les bonnes pratiques de conteneurisation pour une stack multi-conteneurs.

---

## Table des matieres

1. [Demarrage rapide](#demarrage-rapide)
2. [Architecture et reseaux](#1-architecture-et-reseaux)
3. [Volumes et persistance](#2-volumes-et-persistance)
4. [Dockerfiles multi-stage](#3-dockerfiles-multi-stage)
5. [Docker Compose dev/prod](#4-docker-compose-devprod)
6. [Strategie de versioning](#5-strategie-de-versioning)
7. [Gestion des secrets](#6-gestion-des-secrets)
8. [Verification du fonctionnement](#7-verification-du-fonctionnement)
9. [Troubleshooting](#8-troubleshooting)

---

## Demarrage rapide

```bash
# 1. Cloner et configurer
git clone <repo-url>
cd pokeboutique
cp .env.example .env

# 2. Lancer en mode dev
docker compose up --build

# 3. Acceder a l'application
# http://localhost
```

---

## 1. Architecture et reseaux

### Schema d'architecture

```
                         :80 (point d'entree unique)
                              |
                    +---------v---------+
                    |       Nginx       |
                    |   Reverse Proxy   |
                    +---------+---------+
                              |
         +--------------------+--------------------+
         |                                         |
         |              front_net                  |
         |                                         |
   +-----v-----+                           +-------v-------+
   |  Frontend |                           |    Backend    |
   |React/Vite |                           | Node/Express  |
   |   :5173   |                           |    :5000      |
   +-----------+                           +-------+-------+
                                                   |
                              +--------------------+
                              |
                              |    back_net (internal)
                              |
                       +------v------+
                       |   MongoDB   |
                       |   :27017    |
                       +-------------+
```

### Configuration des reseaux

| Reseau | Type | Services | Role |
|--------|------|----------|------|
| `front_net` | bridge | nginx, frontend, backend | Reseau expose pour le trafic HTTP |
| `back_net` | bridge (internal: true) | backend, mongo | Reseau interne isole |

**Isolation de la base de donnees** : MongoDB est uniquement sur `back_net` (reseau interne), inaccessible depuis l'exterieur. Seul le backend peut communiquer avec la DB.

```yaml
# Extrait de compose.yaml
networks:
  front_net:
    driver: bridge
    name: pokeboutique-front
  back_net:
    driver: bridge
    name: pokeboutique-back
    internal: true  # Reseau isole
```

---

## 2. Volumes et persistance

### Volumes utilises

| Volume | Service | Description |
|--------|---------|-------------|
| `pokeboutique-mongo-data` | mongo | Donnees MongoDB persistantes |
| `pokeboutique-frontend-node-modules` | frontend | Dependencies npm (dev) |
| `pokeboutique-backend-node-modules` | backend | Dependencies npm (dev) |

### Demonstration de la persistance

```bash
# 1. Demarrer et peupler la base
docker compose up -d
docker compose exec backend npm run seed

# 2. Verifier les donnees
curl -s http://localhost/api/cards | jq '.data | length'
# Resultat: 2

# 3. Redemarrer completement la stack
docker compose down
docker compose up -d

# 4. Verifier que les donnees persistent
curl -s http://localhost/api/cards | jq '.data | length'
# Resultat: 2 (donnees conservees)

# 5. Supprimer avec les volumes (reset complet)
docker compose down -v
```

---

## 3. Dockerfiles multi-stage

### Structure des stages

Chaque Dockerfile utilise un build multi-stage avec au moins 2 targets (development/production) :

```
+----------+     +----------+     +---------------+
|   base   | --> |   deps   | --> |  development  |  Target dev
+----------+     +----------+     +---------------+
                      |
                      v
                 +----------+     +---------------+
                 |  build   | --> |  production   |  Target prod
                 +----------+     +---------------+
```

### Backend Dockerfile

```dockerfile
# Multi-arch support
FROM --platform=$BUILDPLATFORM node:20-alpine AS base

# Utilisateur non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

# Target development
FROM base AS development
USER nodejs
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/api/health || exit 1
CMD ["dumb-init", "npm", "run", "dev"]

# Target production
FROM base AS production
USER nodejs
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/api/health || exit 1
CMD ["dumb-init", "node", "src/server.js"]
```

### Frontend Dockerfile

```dockerfile
# Multi-arch support
FROM --platform=$BUILDPLATFORM node:20-alpine AS base

# Target development (Vite dev server)
FROM base AS development
HEALTHCHECK CMD wget --spider http://127.0.0.1:5173 || exit 1
CMD ["dumb-init", "npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Target production (Nginx avec fichiers buildes)
FROM nginx:alpine AS production
USER nginx-user
HEALTHCHECK CMD wget --spider http://127.0.0.1:8080 || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

### Caracteristiques implementees

| Critere | Implementation |
|---------|----------------|
| Multi-arch (AMD64/ARM64) | `FROM --platform=$BUILDPLATFORM` |
| Multi-stage build | 5 stages (base, deps, development, build, production) |
| Optimisation cache | `COPY package*.json` avant `COPY .` |
| .dockerignore | Fichiers crees pour backend et frontend |
| Non-root | `USER nodejs` / `USER nginx-user` |
| Healthcheck | `HEALTHCHECK` dans chaque target |

### Build multi-architecture

```bash
# Creer un builder multi-arch
docker buildx create --name multiarch --driver docker-container --use

# Build pour AMD64 et ARM64
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --target production \
  -t ghcr.io/username/pokeboutique-backend:latest \
  --push \
  ./backend
```

---

## 4. Docker Compose dev/prod

### Fichiers de configuration

| Fichier | Role |
|---------|------|
| `compose.yaml` | Configuration de base (mode dev par defaut) |
| `compose.prod.yaml` | Override pour la production |

### Mode developpement

```bash
docker compose up --build
```

Caracteristiques :
- Hot-reload avec volumes montes
- Target `development` des Dockerfiles
- MongoDB sans authentification
- Logs detailles

### Mode production (simulation locale)

```bash
# 1. Configurer le secret
mkdir -p secrets
echo "mot_de_passe_securise" > secrets/mongo_password.txt

# 2. Lancer avec l'override prod
docker compose -f compose.yaml -f compose.prod.yaml up --build
```

Caracteristiques :
- Target `production` des Dockerfiles
- Images optimisees sans devDependencies
- MongoDB avec authentification
- Secrets Docker

### Comparaison dev/prod

| Aspect | Dev | Prod |
|--------|-----|------|
| Target Dockerfile | development | production |
| Volumes code source | Oui (hot-reload) | Non |
| MongoDB auth | Non | Oui (secrets) |
| Frontend | Vite dev server | Nginx + fichiers buildes |
| User | root (volumes) | non-root |

---

## 5. Strategie de versioning

### Registry recommande : GitHub Container Registry (GHCR)

```bash
# Authentification
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Build et push
docker build --target production -t ghcr.io/username/pokeboutique-backend:1.0.0 ./backend
docker push ghcr.io/username/pokeboutique-backend:1.0.0
```

### Convention de tags

| Tag | Usage | Exemple |
|-----|-------|---------|
| `latest` | Derniere version stable | `image:latest` |
| `X.Y.Z` | Version semantique | `image:1.0.0` |
| `sha-XXXXXX` | Commit SHA (tracabilite) | `image:sha-a1b2c3d` |

---

## 6. Gestion des secrets

### Structure

```
secrets/
├── .gitkeep                      # Preserve le dossier dans Git
├── mongo_password.txt.example    # Exemple (commite)
└── mongo_password.txt            # Secret reel (NON commite)
```

### Configuration dans compose.prod.yaml

```yaml
services:
  mongo:
    environment:
      - MONGO_INITDB_ROOT_PASSWORD_FILE=/run/secrets/mongo_password
    secrets:
      - mongo_password

secrets:
  mongo_password:
    file: ./secrets/mongo_password.txt
```

### Regles de securite

- `.gitignore` exclut `secrets/*` sauf `*.example`
- `.env` ne contient jamais de secrets reels
- Seul `.env.example` est commite

---

## 7. Verification du fonctionnement

### Etape 1 : Verifier l'etat des services

```bash
docker compose ps
```

Sortie attendue :
```
NAME                    STATUS           PORTS
pokeboutique-nginx      Up (healthy)     0.0.0.0:80->80/tcp
pokeboutique-frontend   Up (healthy)     5173/tcp
pokeboutique-backend    Up (healthy)     5000/tcp
pokeboutique-mongo      Up (healthy)     27017/tcp
```

### Etape 2 : Tester le health check API

```bash
curl http://localhost/api/health
```

Reponse attendue :
```json
{
  "status": "healthy",
  "timestamp": "2024-12-22T10:00:00.000Z",
  "service": "pokeboutique-api"
}
```

### Etape 3 : Tester la communication DB

```bash
# Peupler la base
docker compose exec backend npm run seed

# Verifier les donnees
curl http://localhost/api/cards
```

### Etape 4 : Tester l'interface web

Ouvrir http://localhost dans un navigateur.

### Etape 5 : Verifier l'isolation reseau

```bash
# Le reseau back_net est interne
docker network inspect pokeboutique-back | grep "Internal"
# Resultat: "Internal": true
```

---

## 8. Troubleshooting

### Erreur : Port 80 deja utilise

```bash
# Diagnostic
sudo lsof -i :80

# Solution
sudo systemctl stop apache2  # ou nginx
# OU modifier NGINX_PORT dans .env
```

### Erreur : Conteneurs en "restarting"

```bash
# Diagnostic
docker compose logs <service>

# Solutions courantes
docker compose down -v          # Reset complet
docker compose build --no-cache # Rebuild sans cache
```

### Erreur : MongoNetworkError

```bash
# Verifier que mongo est pret
docker compose logs mongo

# Tester la connexion
docker compose exec mongo mongosh --eval "db.adminCommand('ping')"
```

### Erreur : EACCES permission denied

```bash
# En mode dev, les volumes peuvent causer des problemes de permissions
# Solution : rebuild
docker compose down -v
docker compose up --build
```

### Erreur : Frontend unhealthy

```bash
# Verifier les logs Vite
docker compose logs frontend

# Le healthcheck peut prendre 30s au demarrage
# Attendre et reverifier
docker compose ps
```

---

## Structure du projet

```
pokeboutique/
├── backend/
│   ├── src/                    # Code source API
│   ├── Dockerfile              # Multi-stage (dev + prod)
│   ├── .dockerignore
│   └── package.json
├── frontend/
│   ├── src/                    # Code source React
│   ├── Dockerfile              # Multi-stage (dev + prod)
│   ├── nginx.conf              # Config Nginx (prod frontend)
│   ├── .dockerignore
│   └── package.json
├── nginx/
│   ├── nginx.conf              # Reverse proxy (dev)
│   └── nginx.prod.conf         # Reverse proxy (prod)
├── secrets/
│   ├── .gitkeep
│   └── mongo_password.txt.example
├── compose.yaml                # Config dev
├── compose.prod.yaml           # Override prod
├── .env.example
├── .gitignore
└── README.md
```

---

## Grille d'evaluation

| Critere | Points | Status |
|---------|--------|--------|
| **Containerisation** | /8 | |
| Multi-arch AMD64/ARM64 | /3 | Implemente |
| Multi-stage builds | /2 | Implemente |
| Images optimisees | /1 | Implemente |
| .dockerignore | /1 | Implemente |
| Healthchecks | /1 | Implemente |
| **Docker Compose** | /11 | |
| Stack complete | /4 | Implemente |
| Mode prod (override) | /2 | Implemente |
| 2 reseaux, DB isolee | /1 | Implemente |
| Volumes persistance | /1 | Implemente |
| Dependances services | /1 | Implemente |
| Secrets | /1 | Implemente |
| Healthchecks compose | /1 | Implemente |
| **Autres** | /1 | |
| Non-root | /1 | Implemente |
| **Documentation** | /-3 | |
| README complet | - | Implemente |
