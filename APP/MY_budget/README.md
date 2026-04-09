# Smart Budget — Application de gestion budgétaire

Application web fullstack de gestion de budget personnel permettant de suivre ses revenus, dépenses et d'analyser ses habitudes financières.

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express |
| Base de données relationnelle | PostgreSQL (transactions, utilisateurs, budgets) |
| Base de données documents | MongoDB (rapports, analytics) |
| Authentification | JWT (jsonwebtoken + bcryptjs) |
| Infrastructure | Docker, Docker Compose, Nginx |

## Architecture

```
┌─────────────────────────────────┐
│  Frontend Next.js (port 3000)   │
├─────────────────────────────────┤
│  Nginx (reverse proxy)          │
├─────────────────────────────────┤
│  Backend Express (port 5001)    │
├─────────────────┬───────────────┤
│  PostgreSQL     │  MongoDB      │
└─────────────────┴───────────────┘
```

## Lancer le projet

### Avec Docker (recommandé)

```bash
docker-compose up --build
```

L'application est accessible sur `http://localhost:3000`.

### En développement local

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # remplir les variables
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Variables d'environnement

Créer un fichier `.env` dans `backend/` :

```env
PORT=5001
JWT_SECRET=votre_secret_jwt_fort
DATABASE_URL=postgresql://user:password@localhost:5432/smartbudget
MONGO_URI=mongodb://localhost:27017/smartbudget
CORS_ORIGIN=http://localhost:3000
```

## API — Endpoints principaux

Toutes les routes (sauf `/api/auth/*` et `/health`) nécessitent un header `Authorization: Bearer <token>`.

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/transactions` | Transactions de l'utilisateur connecté |
| POST | `/api/transactions/add` | Ajouter une transaction |
| PUT | `/api/transactions/:id` | Modifier une transaction |
| DELETE | `/api/transactions/:id` | Supprimer une transaction |
| GET | `/api/transactions/stats` | Statistiques du mois en cours |
| GET | `/api/profile` | Profil de l'utilisateur connecté |
| POST | `/api/profile/save` | Sauvegarder le profil |
| GET | `/api/reports` | Rapports de l'utilisateur connecté |
| GET | `/health` | Health check |

## Sécurité

- Mots de passe hachés avec **bcrypt** (salt rounds : 10)
- Authentification par **JWT** (expiration 7 jours)
- Middleware d'authentification sur toutes les routes protégées
- Protection **IDOR** : vérification de la propriété des ressources avant toute modification ou suppression
- **CORS** restreint aux origines autorisées
- Header `X-Powered-By` désactivé

## Tests

```bash
cd backend
npm test
```

## Structure du projet

```
MY_budget/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # Middleware JWT
│   ├── models/
│   │   └── report.js        # Modèle MongoDB
│   ├── routes/
│   │   ├── auth.js          # Register / Login
│   │   ├── profile.js       # Profil utilisateur
│   │   └── transactions.js  # CRUD transactions
│   ├── __tests__/
│   ├── db.js                # Connexions PostgreSQL + MongoDB
│   ├── index.js             # Point d'entrée Express
│   └── init.sql             # Schéma PostgreSQL
├── frontend/
│   └── src/app/             # Pages et composants Next.js
├── nginx/                   # Configuration reverse proxy
└── docker-compose.yml
```
