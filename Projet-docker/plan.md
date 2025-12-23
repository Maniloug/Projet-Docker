# Plan de livraison – PokéBoutique

## Objectif produit
- Boutique e-commerce monopage spécialisée dans les cartes Pokémon premium.
- Parcours complet attendu : catalogue, fiche produit, panier persistant via `x-session-id`, checkout simulé et écran de confirmation.
- Livrables inclus : API Node/Express + MongoDB, frontend React/Tailwind, jeux de tests Jest/Vitest, orchestration Docker et documentation.

## Phase 0 – Setup et outillage — [Livré]
- **0.1 Monorepo** : `backend/`, `frontend/`, `.github/` (prompts Copilot), `docker-compose.yml`, `README.md` et `plan.md` centralisent l état des travaux.
- **0.2 Initialisation backend** : `npm init -y`, dépendances `express`, `mongoose`, `cors`, `dotenv`, `morgan`, devDependencies `nodemon`, `jest`, `supertest`, `mongodb-memory-server`.
- **0.3 Initialisation frontend** : `npm create vite@latest frontend -- --template react`, ajout `tailwindcss`, `postcss`, `autoprefixer`, `react-router-dom`, `axios`, `vitest`, `@testing-library/*`.
- **0.4 Scripts et qualité** : `npm run dev`, `npm test`, `npm run seed` côté backend ; `npm run dev`, `npm run build`, `npm run test` côté frontend ; Vitest configuré via `setupTests.js`.
- **0.5 Conventions IA** : `.github/copilot-instructions.md` fixe les règles de style, d architecture et de tests appliquées pendant toute la génération assistée.

## Phase 1 – Backend API Node/Express — [Livré]
- **1.1 Architecture** : `src/app.js` (middlewares, routing, erreurs), `src/server.js` (bootstrap HTTP + connexion), `src/routes/index.js` pour agréger `cardRoutes` et `cartRoutes`.
- **1.2 Modèles & schémas** :
  - `Card` (`card.model.js`) : name, slug, series, rarity, type, price, stock, description, imageUrl, tags[], metadata.
  - `Cart` (`cart.model.js`) : sessionId, items[{ card (ref Card), quantity }].
- **1.3 Services & contrôleurs** :
  - `cardService` gère les filtres (type, rarity, series, tags, search) + lookup par ObjectId ou slug, exposé via `cardController`.
  - `cartService` encapsule cart lifecycle (create, add/update/remove, checkout, clear) et formatte les totaux ; `cartController` lit `x-session-id` (fallback IP).
- **1.4 Seed & fixtures** : `scripts/seed.js` alimente Pikachu V et Charizard GX ; se lance via `npm run seed` ou `docker compose exec backend npm run seed`.
- **1.5 Observabilité & erreurs** : `morgan` pour les logs HTTP, middleware 404 + handler global JSON ; erreurs métier portées par `cartService` (status + message).

### Endpoints exposés
| Méthode | Route | Description | Statut |
|---------|-------|-------------|--------|
| GET | `/api/cards` | Liste de cartes avec filtres query (`type`, `rarity`, `series`, `tags`, `search`). | Livré |
| GET | `/api/cards/:cardId` | Fiche par ObjectId ou slug. | Livré |
| POST | `/api/cards` | Création d une carte (formulaire admin). | Livré |
| DELETE | `/api/cards/:cardId` | Suppression d une carte (depuis la fiche produit). | Livré |
| GET | `/api/cart` | Récupère/initialise le panier en fonction de `x-session-id`. | Livré |
| POST | `/api/cart` | Ajoute une carte avec quantité (défaut 1). | Livré |
| PUT | `/api/cart/:cardId` | Met à jour la quantité ; `<=0` déclenche suppression. | Livré |
| DELETE | `/api/cart/:cardId` | Supprime une ligne. | Livré |
| POST | `/api/cart/checkout` | Simule paiement, renvoie `{ status, orderId, total, items }`. | Livré |

## Phase 2 – Frontend React/Tailwind — [Livré]
- **2.1 Structure Vite** : `src/main.jsx` instancie `BrowserRouter` + `CartProvider`; `App.jsx` porte les routes `/`, `/cards/:cardId`, `/cart`, `/checkout`, `/confirmation`, `/admin/cards/new`.
- **2.2 Layout & navigation** : `Layout` + `Navbar` (badge du panier, navigation active) + container responsive Tailwind.
- **2.3 Catalogue (`ProductsPage`)** : consommation de `useProducts`, affichage cartes via `ProductCard` (CTA détails/ajout, info stock/prix/tagline).
- **2.4 Fiche produit (`ProductDetailPage`)** : chargement paresseux via `getCard`, sélection quantité bornée au stock, action `addToCart`, bouton admin pour supprimer une carte.
- **2.5 Panier & checkout** :
  - `CartPage` : inline updates (input quantité, bouton retirer), total dynamique, lien `/checkout`.
  - `CheckoutPage` : résumé panier, formulaire factice (nom/email/adresse), appel `checkout()` et redirection `useNavigate` vers `/confirmation`.
  - `ConfirmationPage` : récapitulatif commande depuis `location.state` + CTA retour au catalogue.
- **2.6 State & data layer** :
  - `CartProvider` / `useCart` orchestrent chargement initial, add/update/remove, checkout et erreurs.
  - `useProducts` gère fetch + fallback erreur/chargement.
  - Client HTTP `src/api/httpClient.js` (axios, baseURL configurable, stockage local du `SESSION_KEY`, header `x-session-id`).
- **2.7 UI/UX** : Tailwind 3.4, messages d état (chargement/erreur), composants responsives (grid 1-3 colonnes), boutons accentués, toast de confirmation pour chaque ajout au panier, formulaire admin accessible depuis la navbar + actions CRUD (création/suppression) depuis l interface.

## Phase 3 – Tests & QA — [En cours]
- **3.1 Backend (Jest + MongoMemory)** :
  - `tests/services/cardService.test.js` (mocks Mongoose, vérifie filtres/lookup).
  - `tests/services/cartService.test.js` (MongoMemoryServer, Core/Input/Error/Side Effects).
  - `tests/integration/cartRoutes.test.js` (supertest sur `/api/cart` + `/checkout`).
  - TODO : `cardRoutes`, contrôleurs checkout détaillé, tests d erreurs réseau.
- **3.2 Frontend (Vitest + RTL)** :
  - `src/__tests__/App.test.jsx` (routing minimal).
  - `ProductsPage.test.jsx` (Core/Error/Side Effects via mocks hooks).
  - `useCart.test.jsx` (normalisation, refresh, add/update/remove/checkout, erreurs API).
  - TODO : tests `CartPage`, `CheckoutPage`, `ProductDetailPage`, `useProducts` (msw), snapshots visuels.
- **3.3 Objectifs qualité** : Couverture globale visée ≥70 % (ref README). Ajout futur d un rapport Vitest/Jest commun et intégration CI.

## Phase 4 – Infra & exploitation — [En cours]
- **4.1 Docker Compose** : services `mongo` (volume `mongo-data`), `backend` (port 5000, `MONGO_URI` injecté), `frontend` (port 5173, proxy `/api` → service `backend` via `VITE_API_PROXY_TARGET`).
- **4.2 Environnements** : `.env` backend (PORT, MONGO_URI local) + variables injectées par Compose ; côté frontend, les appels passent par `/api` (proxy Vite) sauf si `VITE_API_URL` est explicitement défini pour un déploiement différent.
- **4.3 Observabilité** : logs HTTP (morgan), messages JSON structurés côté API ; backlog : ajouter Winston + corrélation request-id.
- **4.4 Automatisation** : scripts d installation/test déjà documentés dans `README`. CI/CD (GitHub Actions) encore à écrire.

## Phase 5 – Roadmap & prochaines itérations — [À planifier]
1. Améliorer la persistance panier : expiration serveur + régénération propre du `SESSION_KEY` (actuellement stockage local simple).
2. Ajouter pagination + filtres UI (type, rareté, tags) en s appuyant sur `cardService.buildQuery` déjà disponible.
3. Étendre les tests : contrôleurs backend restants, pages React critiques et interactions checkout (user-event end-to-end légère).
4. Industrialiser (lint, format, tests, build) via pipeline GitHub Actions + badge de couverture.
5. Ajouter feedbacks visuels (toasts après ajout, skeleton loaders) et monitoring (Sentry ou équivalent) avant mise en prod.

## Prompts IA utilisés

### 6.1 Prompts persistés dans le dépôt
1. **`.github/copilot-instructions.md`** — impose CommonJS côté backend, React 18 + hooks côté frontend, séparation routes/contrôleurs/services, Tailwind pour l UI, usage systématique de Jest/Vitest et exigences accessibilité.
2. **`.github/prompt/generate-unit-tests.prompt.md`** — brief complet pour générer les tests (couverture ≥70 %, pattern AAA, axes Core/Input/Error/Side Effects, mocking axios/Mongoose, priorités catalogue/panier/checkout).

### 6.2 Prompts ad hoc (principaux extraits)
| Bloc livré | Prompt (résumé) | Résultat |
|------------|-----------------|----------|
| Architecture repo | "Agis comme un lead dev Node.js/React. Propose la structure complète d un monorepo PokéBoutique (backend Express + frontend Vite + Docker + seeds)." | Génération des dossiers `backend/`, `frontend/`, scripts npm et configuration Compose décrits en Phase 0. |
| Service panier | "Écris un service cartService pour Express + Mongoose avec add/update/remove/checkout, validation des quantités et formatage des totaux." | Implémentation de `cartService.js` + contrôleur associé, gestion `x-session-id` et erreurs HTTP. |
| API cartes | "Fourni un `cardService` capable de filtrer par type/rareté/tags et de retrouver une carte via ObjectId ou slug." | Fichier `cardService.js` + endpoints `/api/cards` opérationnels. |
| Hook & contexte panier | "Construi(s) un `CartProvider` React + hook `useCart` qui appelle les API axios, gère loading/error, synchronise add/update/remove/checkout." | Hook `useCart.jsx`, contexte global, rafraîchissement initial et normalisation des données utilisés par toutes les pages. |
| UI Checkout | "Génère les pages React/Tailwind pour le catalogue, le panier, un checkout avec formulaire factice et une page de confirmation s appuyant sur les hooks existants." | Pages `ProductsPage`, `CartPage`, `CheckoutPage`, `ConfirmationPage`, composants `ProductCard`/`Navbar`. |
| Tests front | "Avec Vitest + React Testing Library, écris des tests AAA pour `ProductsPage` et `useCart` en mockant les hooks/API." | Suites `ProductsPage.test.jsx` et `useCart.test.jsx` couvrant Core/Error/Side Effects. |

Ces prompts (persistés ou ad hoc) ont guidé l usage de Copilot/ChatGPT pour produire le code actuel.
