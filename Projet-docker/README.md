PokeBoutique - Projet Docker

Application e-commerce de cartes Pokemon conteneurisée avec Docker.

1) Installation

```bash
# Cloner le projet
git clone <votre-repo>
cd pokeboutique

# Copier la config
cp .env.example .env
```

 2) Lancer en mode développement

```bash
docker compose up --build
```

Accéder à l'application : **http://localhost**

3) Lancer en mode production

```bash
# Créer le secret MongoDB
mkdir -p secrets
echo "mot_de_passe_securise" > secrets/mongo_password.txt

# Lancer
docker compose -f compose.yaml -f compose.prod.yaml up --build
```

Accéder à l'application : **http://localhost**

 4) Vérifier que ça marche

```bash
# 1. Tous les services doivent être "healthy"
docker compose ps

# 2. Tester l'API
curl http://localhost/api/health

# 3. Ajouter des cartes d'exemple
curl -X POST http://localhost/api/seed

# 4. Vérifier les cartes
curl http://localhost/api/cards
```

 5) Tester la persistance

```bash
# 1. Ajouter des cartes
curl -X POST http://localhost/api/seed

# 2. Redémarrer
docker compose restart

# 3. Vérifier que les cartes sont toujours là
curl http://localhost/api/cards
```
## 6) Build multi-architecture

```bash
# Créer le builder
docker buildx create --name multiarch --use

# Build backend (AMD64 + ARM64)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --target production \
  -t ghcr.io/VOTRE_USERNAME/pokeboutique-backend:1.0.0 \
  ./backend \
  --push

# Build frontend (AMD64 + ARM64)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --target production \
  -t ghcr.io/VOTRE_USERNAME/pokeboutique-frontend:1.0.0 \
  ./frontend \
  --push
```

## 7) Architecture

```
Navigateur → Nginx (port 80) → Frontend + Backend → MongoDB (isolée)
```

**Réseaux :**
- `front_net` : Nginx, Frontend, Backend
- `back_net` : Backend, MongoDB (réseau interne isolé)

**Volumes :**
- `pokeboutique-mongo-data` : Persistance MongoDB





 8) Problèmes courants

### Port 80 déjà utilisé
```bash
sudo lsof -i :80
sudo systemctl stop apache2
```

### Conteneur qui redémarre en boucle
```bash
docker compose logs backend
docker compose down -v
docker compose up --build
```

### Erreur MongoDB
```bash
docker compose logs mongo
docker compose restart mongo
```
