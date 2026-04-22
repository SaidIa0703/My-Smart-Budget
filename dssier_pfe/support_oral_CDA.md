# Support Oral CDA — My Smart Budget
## Concepteur Développeur d'Applications | Durée : 1h

---

# PLAN DE PRÉSENTATION

| # | Section | Durée |
|---|---------|-------|
| 1 | Introduction en anglais (QQOQCP) | 5 min |
| 2 | Présentation du projet & contexte | 5 min |
| 3 | Méthodologie & organisation | 5 min |
| 4 | Conception fonctionnelle & BDD | 10 min |
| 5 | DÉMONSTRATION | 8 min |
| 6 | Code Frontend — points techniques | 7 min |
| 7 | Code Backend & API REST | 7 min |
| 8 | Sécurité applicative | 5 min |
| 9 | Tests & qualité logicielle | 4 min |
| 10 | Déploiement & DevOps | 4 min |
| **Total** | | **~60 min** |

---

---

# SLIDE 1 — INTRODUCTION EN ANGLAIS (5 min)

> Commencer obligatoirement en anglais. Regarder le jury.

## Texte à dire :

> "Good morning, and thank you for having me today.
>
> My name is [Votre Prénom NOM], and I am a student in the CDA program — Concepteur Développeur d'Applications — at Colint School.
>
> Today, I am going to present **My Smart Budget**, a full-stack web application I designed and developed during my work-study program.
>
> Let me give you a quick overview using the QQOQCP framework.
>
> **WHO?** — The target users are individuals who want to take control of their personal finances: students, employees, and families.
>
> **WHAT?** — My Smart Budget is a web application that allows users to track their income and expenses, manage budgets by category, set financial goals, and visualize their spending through reports.
>
> **WHERE?** — The application is accessible via a web browser, and it is deployed online using Docker containers.
>
> **WHEN?** — The project was developed over approximately six months, from design to deployment.
>
> **HOW?** — I built the application using Next.js for the frontend, Node.js and Express for the backend REST API, PostgreSQL for relational data, and MongoDB for analytics reports.
>
> **WHY?** — Many people struggle to manage their money without the right tools. My Smart Budget provides a simple, personalized, and secure experience to help users make better financial decisions.
>
> Now I will switch to French for the rest of the presentation."

---

---

# SLIDE 2 — PRÉSENTATION DU PROJET (5 min)

## Titre du slide : My Smart Budget — Contexte et problématique

### Ce que vous dites :

**Problématique :**
> "La gestion du budget personnel est une problématique concrète : beaucoup de gens ne savent pas où va leur argent. Les applications existantes sont souvent soit trop complexes, soit trop génériques. J'ai donc décidé de créer **My Smart Budget**, une application web complète, personnalisée selon le profil de l'utilisateur."

**Objectifs SMART :**
- **Spécifique** : Application web de gestion budgétaire multi-profil (étudiant, salarié, famille)
- **Mesurable** : API REST fonctionnelle, tests automatisés, déploiement Docker
- **Atteignable** : Stack maîtrisée (Next.js, Node.js, PostgreSQL, MongoDB)
- **Réaliste** : MVP livré en 6 mois avec toutes les fonctionnalités core
- **Temporel** : Développé dans le cadre de l'alternance CDA 2024-2025

**Fonctionnalités principales :**
- Inscription / connexion sécurisée (JWT)
- Questionnaire d'onboarding en 7 étapes (personnalisation du profil)
- Dashboard avec statistiques en temps réel
- Gestion des transactions (CRUD complet)
- Gestion des budgets par catégorie
- Objectifs d'épargne (Goals)
- Rapports analytiques (MongoDB)
- Interface responsive (mobile + desktop)

---

---

# SLIDE 3 — MÉTHODOLOGIE & ORGANISATION (5 min)

## Titre du slide : Méthodologie Agile et outils

### Ce que vous dites :

**Méthode Agile / Scrum :**
> "J'ai travaillé avec une méthode Agile adaptée à un développeur solo. J'ai découpé le projet en sprints d'une à deux semaines, avec des backlog items priorisés."

**Outils utilisés :**
| Outil | Usage |
|-------|-------|
| **GitHub** | Versioning, branches par feature |
| **VS Code** | IDE principal |
| **Docker** | Containerisation locale et production |
| **SonarCloud** | Analyse qualité du code |
| **Postman** | Tests des routes API |
| **draw.io** | Diagrammes UML et Merise |

**Conventions Git :**
> "J'ai utilisé des branches dédiées par fonctionnalité (ex: `feat/transactions`, `fix/profile`), avec des commits conventionnels : `feat`, `fix`, `docs`, `refactor`. Chaque merge sur `main` déclenchait une analyse SonarCloud."

**Exemple d'un sprint :**
> "Sprint 3 — Authentification : création des routes register/login, middleware JWT, tests unitaires avec Supertest, intégration frontend."

---

---

# SLIDE 4 — CONCEPTION FONCTIONNELLE (10 min)

## 4.1 — Architecture 3 tiers

### Schéma à montrer :

```
┌──────────────────────────────────────────┐
│   COUCHE PRÉSENTATION                    │
│   Next.js 15 + React 19 + TypeScript     │
│   Tailwind CSS + Recharts                │
├──────────────────────────────────────────┤
│   COUCHE MÉTIER (API REST)               │
│   Node.js + Express                      │
│   Middleware : JWT, Helmet, Rate Limit   │
├──────────────────────────────────────────┤
│   COUCHE ACCÈS DONNÉES                   │
│   pg-promise (PostgreSQL)                │
│   Mongoose (MongoDB)                     │
├──────────────────────────────────────────┤
│   COUCHE PERSISTANCE                     │
│   PostgreSQL 16 | MongoDB 7              │
└──────────────────────────────────────────┘
```

### Ce que vous dites :
> "Mon application respecte strictement l'architecture 3 tiers. La couche présentation est entièrement en Next.js. La couche métier est une API REST Express. La couche accès aux données utilise pg-promise pour PostgreSQL et Mongoose pour MongoDB. Les deux bases sont bien séparées : PostgreSQL pour les données transactionnelles, MongoDB pour les rapports analytiques dont la structure peut évoluer."

---

## 4.2 — Cas d'utilisation (Use Cases)

### Acteurs :
- **Utilisateur non connecté** : Accès login/register
- **Utilisateur connecté** : Dashboard, transactions, budgets, goals, rapports, profil

### Cas principaux :
```
Utilisateur non connecté
  ├── UC1 : S'inscrire
  └── UC2 : Se connecter

Utilisateur connecté
  ├── UC3 : Remplir le questionnaire de profil
  ├── UC4 : Consulter le dashboard
  ├── UC5 : Ajouter / modifier / supprimer une transaction
  ├── UC6 : Gérer ses budgets par catégorie
  ├── UC7 : Définir ses objectifs d'épargne
  ├── UC8 : Consulter les rapports
  └── UC9 : Modifier son profil
```

### Ce que vous dites :
> "J'ai identifié deux acteurs principaux. L'utilisateur non connecté peut uniquement s'inscrire ou se connecter. Une fois authentifié, il accède à toutes les fonctionnalités : tableau de bord, gestion des transactions avec CRUD complet, budgets, objectifs, et rapports."

---

## 4.3 — Diagramme de séquence — Authentification

```
Utilisateur      Frontend (Next.js)       Backend (Express)      PostgreSQL
    |                   |                        |                    |
    |-- POST /register ->|                        |                    |
    |                   |-- POST /api/auth/register -->               |
    |                   |                        |-- SELECT email ---->|
    |                   |                        |<-- null ------------|
    |                   |                        |-- bcrypt.hash()    |
    |                   |                        |-- INSERT user ----->|
    |                   |                        |<-- user.id ---------|
    |                   |                        |-- jwt.sign() -->   |
    |                   |<-- { token, user } -----|                    |
    |<-- localStorage.setItem('token') --|        |                    |
    |                   |                        |                    |
```

### Ce que vous dites :
> "Voici le flux d'authentification. L'utilisateur soumet le formulaire. Le frontend envoie une requête POST. Le backend vérifie que l'email n'existe pas déjà en base, hashe le mot de passe avec bcrypt, insère l'utilisateur, puis génère un token JWT signé. Ce token est stocké côté client dans le localStorage et envoyé dans le header `Authorization: Bearer <token>` à chaque requête protégée."

---

## 4.4 — Conception BDD

### Schéma relationnel PostgreSQL :

```
users
  ├── id (PK, SERIAL)
  ├── name (VARCHAR 255)
  ├── email (VARCHAR 255, UNIQUE)
  ├── password (VARCHAR 255) ← hashé bcrypt
  ├── created_at
  └── updated_at

transactions
  ├── id (PK, SERIAL)
  ├── user_id (FK → users.id, CASCADE DELETE)
  ├── name (VARCHAR 255)
  ├── category (VARCHAR 255)
  ├── amount (DECIMAL 10,2)  ← positif=revenu, négatif=dépense
  ├── date (DATE)
  ├── is_recurring (BOOLEAN)
  ├── created_at
  └── updated_at

budgets
  ├── id (PK, SERIAL)
  ├── user_id (FK → users.id, CASCADE DELETE)
  ├── category (VARCHAR 255)
  ├── limit (DECIMAL 10,2)
  ├── created_at
  └── updated_at

user_profiles
  ├── user_id (PK, FK → users.id)
  ├── profile_type (étudiant | salarié | famille)
  ├── revenus_mensuels
  ├── situation_familiale
  ├── objectifs_epargne
  └── categories_prioritaires
```

### Collection MongoDB — Reports :

```json
{
  "_id": ObjectId,
  "userId": "1",
  "title": "Rapport Avril 2025",
  "description": "Synthèse mensuelle",
  "type": "monthly",
  "data": { /* structure flexible */ },
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### Ce que vous dites :
> "J'ai fait le choix d'utiliser deux bases de données complémentaires. PostgreSQL pour toutes les données relationnelles et transactionnelles : utilisateurs, transactions, budgets, profils. Les clés étrangères avec CASCADE DELETE assurent l'intégrité référentielle. MongoDB pour les rapports analytiques, car leur structure de données est flexible et peut évoluer sans migration de schéma. C'est un choix architectural documenté dans mon DECISIONS.md."

---

---

# SLIDE 5 — DÉMONSTRATION (8 min)

## Script de démonstration

> Ouvrir le navigateur sur `http://localhost:3000` (ou l'URL de production)

### Parcours de démonstration :

**1. Page d'accueil / Login (1 min)**
> "Je commence par la page de connexion. L'interface est épurée, responsive, et utilise Tailwind CSS pour le design. Je me connecte avec un compte de test."

**2. Questionnaire d'onboarding (2 min)**
> "À la première connexion, l'utilisateur est guidé par ce questionnaire en 7 étapes. Montrer l'animation entre les étapes. Étape 1 : choix du profil (étudiant / salarié / famille). Étape 3 : revenus mensuels. Étape 5 : objectifs d'épargne. Étape 7 : récapitulatif avec conseils personnalisés générés dynamiquement selon les réponses."

**3. Dashboard (2 min)**
> "Le tableau de bord affiche les statistiques du mois : total revenus, total dépenses, nombre de transactions. Les graphiques sont réalisés avec Recharts. Les données sont récupérées en temps réel depuis l'API."

**4. Transactions — CRUD (2 min)**
> "Ici la gestion des transactions. Je peux ajouter une nouvelle transaction en renseignant le nom, la catégorie, le montant et la date. Je montre la modification et la suppression. Une transaction avec un montant positif est un revenu, négatif une dépense."

**5. Profil (1 min)**
> "Chaque type de profil a sa propre page dédiée avec les objectifs et les réglages. Les données sont persistées en base."

---

---

# SLIDE 6 — CODE FRONTEND (7 min)

## Titre du slide : Développement Frontend — Next.js 15

### Ce que vous dites :

**Stack Frontend :**
> "Le frontend est développé en **Next.js 15** avec React 19 et TypeScript. J'utilise le App Router de Next.js, qui permet le routing basé sur le système de fichiers. Tailwind CSS gère le style, Recharts les graphiques."

**Point technique 1 — Le Questionnaire (questionnaire.tsx)**
> "Je vais vous montrer un exemple de composant complexe : le questionnaire d'onboarding. Il gère 7 étapes avec un état local. La validation par étape est faite dans la fonction `canNext()`. La soumission appelle l'API `/api/profile/save` avec le token JWT dans le header. Les animations entre étapes sont gérées via des transitions CSS conditionnelles."

```tsx
// Validation par étape — extrait questionnaire.tsx
const canNext = () => {
  if (step === 1) return !!answers.profileType;
  if (step === 2) return !!answers.situationFamiliale;
  if (step === 3) return !!answers.revensuMensuels;
  if (step === 4) return answers.dettes.length > 0;
  if (step === 5) return answers.objectifsEpargne.length > 0;
  if (step === 6) return answers.categoriesPrioritaires.length > 0;
  return true;
};
```

**Point technique 2 — Protection des routes**
> "La protection des routes côté frontend est faite dans chaque page protégée avec un `useEffect` qui vérifie la présence du token. Si absent, redirection vers `/login`."

```tsx
// Dashboard — protection de route côté client
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
  }
}, []);
```

**Point technique 3 — Conseils personnalisés dynamiques**
> "La fonction `generateAdvice()` génère des conseils financiers personnalisés en fonction des réponses au questionnaire. Par exemple, si le profil est 'étudiant', on affiche la règle 50/30/20. Si des dettes sont déclarées, on recommande de les prioriser."

**Point technique 4 — Architecture pages Next.js**
> "L'architecture respecte le principe de colocations : chaque route est un dossier avec son `page.tsx`. Les composants réutilisables sont dans `/components`. J'ai des profils distincts : étudiant, salarié, famille, jeune, adulte, senior — chacun avec sa propre page."

---

---

# SLIDE 7 — CODE BACKEND & API REST (7 min)

## Titre du slide : Développement Backend — Node.js + Express

### Ce que vous dites :

**Architecture de l'API :**
> "Le backend est une API REST en **Node.js avec Express**. Elle expose les endpoints suivants :"

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |
| GET | /api/auth/verify | Vérification token |
| GET | /api/transactions | Lister les transactions |
| POST | /api/transactions/add | Créer une transaction |
| PUT | /api/transactions/:id | Modifier |
| DELETE | /api/transactions/:id | Supprimer |
| GET | /api/transactions/stats | Statistiques mensuelles |
| POST | /api/profile/save | Sauvegarder le profil |
| GET | /api/profile | Récupérer le profil |
| GET | /api/reports | Rapports MongoDB |
| POST | /api/reports | Créer un rapport |

**Point technique 1 — userId extrait du JWT**
> "Un choix de sécurité important : je n'accepte jamais le userId depuis le corps de la requête. Il est toujours extrait du token JWT décodé par le middleware. Ainsi, un utilisateur ne peut jamais manipuler des données qui ne lui appartiennent pas."

```js
// transactions.js — userId issu du JWT, jamais du body
router.post('/add', async (req, res) => {
  const userId = req.user.userId; // extrait du token
  const { name, category, amount, date } = req.body;
  // ...
});
```

**Point technique 2 — Stats SQL avec agrégation**
> "La route `/stats` effectue une requête SQL avec agrégation conditionnelle pour calculer revenus et dépenses du dernier mois en une seule requête, sans charger toutes les transactions en mémoire."

```js
SELECT
  SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_revenus,
  SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_depenses,
  COUNT(*) as total_transactions
FROM transactions
WHERE user_id = $1 AND date >= NOW() - INTERVAL '1 month'
```

**Point technique 3 — Upsert PostgreSQL (profil)**
> "Pour sauvegarder le profil, j'utilise un `INSERT ... ON CONFLICT DO UPDATE` — le fameux UPSERT. Si le profil existe déjà, il est mis à jour. Sinon, il est créé. Une seule requête, pas de double appel."

**Point technique 4 — Accès PostgreSQL ET MongoDB**
> "Le fichier `db.js` gère les deux connexions. Les variables d'environnement sont validées au démarrage : si une est manquante, le serveur refuse de démarrer. C'est une pratique de fail-fast qui évite des bugs silencieux en production."

---

---

# SLIDE 8 — SÉCURITÉ APPLICATIVE (5 min)

## Titre du slide : Sécurité — OWASP & bonnes pratiques

### Ce que vous dites :

> "La sécurité est un axe central de mon projet. J'ai mis en place plusieurs couches de protection."

**1. Authentification JWT + bcrypt**
> "Les mots de passe sont hashés avec bcrypt (salt factor 10). L'authentification utilise des tokens JWT signés avec un secret d'environnement, expirant après 7 jours."

**2. Helmet — En-têtes HTTP sécurisés**
> "Helmet ajoute automatiquement des headers de sécurité : Content-Security-Policy, X-Frame-Options, X-Content-Type-Options. J'ai aussi désactivé le header `X-Powered-By` pour ne pas exposer la technologie utilisée."

```js
app.use(helmet());
app.disable('x-powered-by');
```

**3. Rate Limiting — Protection brute force**
> "J'ai mis en place un rate limiter sur les routes d'authentification : maximum 20 tentatives sur 15 minutes. Au-delà, la requête est rejetée avec un message clair."

```js
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Trop de tentatives, réessayez dans 15 minutes' },
});
```

**4. Protection IDOR — ownerGuard**
> "C'est l'un des points de sécurité dont je suis le plus fier. J'ai créé un middleware `ownerGuard` qui vérifie, avant toute modification ou suppression d'une transaction, que la ressource appartient bien à l'utilisateur connecté. Sans ça, un utilisateur malveillant pourrait modifier les transactions d'autres utilisateurs en changeant l'id dans l'URL. C'est une attaque IDOR — Insecure Direct Object Reference."

```js
// ownerGuard.js — protection IDOR
const existing = await db.oneOrNone(
  'SELECT id FROM transactions WHERE id = $1 AND user_id = $2',
  [id, userId]
);
if (!existing) return res.status(403).json({ message: 'Accès refusé' });
```

**5. Validation des entrées**
> "Côté backend, tous les champs sont validés avant traitement. Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre. La taille du body JSON est limitée à 10kb pour éviter les payloads abusifs."

**6. CORS configuré**
> "Le CORS n'autorise que les origines explicitement déclarées en variable d'environnement. En production, seul le domaine de l'application est autorisé."

---

---

# SLIDE 9 — TESTS & QUALITÉ (4 min)

## Titre du slide : Tests automatisés & SonarCloud

### Ce que vous dites :

**Stratégie de tests :**
> "J'ai appliqué la pyramide des tests. La base est constituée de tests unitaires avec Jest. Pour le backend, j'utilise Supertest pour tester les routes HTTP directement."

**Tests routes Auth (auth.routes.test.js) :**
> "J'ai 10 tests couvrant les cas nominaux et les cas d'erreur :"
- POST /register — champs manquants → 400
- POST /register — mot de passe faible → 400
- POST /register — email déjà utilisé → 400
- POST /register — inscription réussie → 201 + token
- POST /login — champs manquants → 400
- POST /login — email inexistant → 401
- POST /login — mauvais mot de passe → 401
- POST /login — connexion réussie → 200 + token
- GET /verify — token manquant → 401
- GET /verify — token valide → 200 + `valid: true`

**Isolation des tests :**
> "La base de données est mockée avec `jest.mock('../db')`. Chaque test est indépendant grâce à `beforeEach(() => jest.clearAllMocks())`. Aucune connexion réelle à la BDD n'est requise pour faire tourner les tests."

**SonarCloud :**
> "Le code est analysé en continu par SonarCloud. Le projet est configuré avec `sonar-project.properties`. L'analyse exclut les node_modules, le dossier `.next`, et les fichiers de tests. Les rapports de couverture au format lcov sont envoyés automatiquement."

---

---

# SLIDE 10 — DÉPLOIEMENT & DEVOPS (4 min)

## Titre du slide : Docker & Déploiement

### Ce que vous dites :

**Containerisation avec Docker Compose :**
> "L'ensemble de l'application est containerisée avec Docker. Le fichier `docker-compose.yml` orchestre 4 services :"

```
Services Docker :
┌─────────────────────────────────────────┐
│  frontend       (port 3000)             │
│  backend        (port 5001)             │
│  postgres:16-alpine (port 5432)         │
│  mongo:7        (port 27017)            │
└─────────────────────────────────────────┘
```

**Healthchecks :**
> "Les services `postgres` et `mongodb` ont des healthchecks configurés. Le backend ne démarre que quand les deux bases de données sont prêtes (`depends_on: condition: service_healthy`). Ça évite les crashs au démarrage."

**Images Docker Hub :**
> "J'ai publié mes images sur Docker Hub : `abedel/my-smart-budget-backend` et `abedel/my-smart-budget-frontend`. N'importe qui peut déployer l'application avec un simple `docker compose up`."

**Variables d'environnement :**
> "Toutes les données sensibles (mot de passe BDD, JWT_SECRET, URL MongoDB) sont injectées via des variables d'environnement. Elles ne sont jamais hardcodées dans le code. En production, l'URL de l'API est `https://smarterbudget.net/api`."

**Réseau interne Docker :**
> "Tous les services partagent un réseau bridge interne `smart-budget-network`. Le frontend appelle le backend par son nom de service Docker, pas par `localhost`. C'est la bonne pratique pour les environnements containerisés."

---

---

# CONCLUSION (incluse dans la durée totale)

## Ce que vous dites pour conclure :

> "Pour conclure, ce projet m'a permis de mettre en pratique l'ensemble des compétences du titre CDA :
>
> - **CCP1** : J'ai développé une interface utilisateur complète en Next.js, des composants backend en Node.js/Express, et contribué à la gestion du projet avec Git et une méthode Agile.
>
> - **CCP2** : J'ai conçu l'architecture logicielle 3 tiers, modélisé et implémenté une base de données relationnelle PostgreSQL avec migrations, et utilisé MongoDB comme base NoSQL pour les rapports.
>
> - **CCP3** : J'ai mis en place des tests automatisés avec Jest et Supertest, déployé l'application avec Docker Compose, et configuré l'analyse qualité avec SonarCloud.
>
> Les principales difficultés rencontrées ont été la gestion de la double connexion BDD (PostgreSQL + MongoDB), et la mise en place des protections IDOR. Ces challenges m'ont permis d'approfondir ma compréhension de la sécurité applicative.
>
> Je suis ouvert à vos questions."

---

---

# QUESTIONS FRÉQUENTES DU JURY — Vos réponses préparées

## Q1 : "Expliquez votre architecture 3 tiers"
> "Mon application est organisée en 3 couches strictement séparées. La couche présentation est le frontend Next.js : elle affiche les données et gère les interactions utilisateur. La couche métier est l'API Express : elle contient toute la logique applicative, la validation, la sécurité. La couche persistance est constituée de PostgreSQL pour les données relationnelles et MongoDB pour les rapports. Chaque couche ne connaît que la couche immédiatement inférieure."

## Q2 : "Comment avez-vous sécurisé votre application ?"
> "J'ai sécurisé l'application sur plusieurs niveaux. Authentification : JWT + bcrypt. Protection brute force : rate limiting à 20 requêtes / 15 min sur les routes d'auth. En-têtes HTTP : Helmet. Protection IDOR : le middleware ownerGuard vérifie que chaque ressource appartient à l'utilisateur qui la modifie. Validation des entrées : regex sur le mot de passe, limite de payload à 10kb. CORS restreint aux origines autorisées."

## Q3 : "Pourquoi PostgreSQL ET MongoDB ?"
> "C'est une décision architecturale documentée. PostgreSQL garantit l'intégrité référentielle avec les clés étrangères — essentiel pour les transactions financières. MongoDB offre une flexibilité de schéma pour les rapports analytiques : la structure d'un rapport peut changer sans migration. C'est le pattern polyglot persistence, adapté quand deux cas d'usage ont des besoins structurellement différents."

## Q4 : "Qu'est-ce qu'une attaque IDOR et comment vous en protégez-vous ?"
> "IDOR signifie Insecure Direct Object Reference. Sans protection, un utilisateur connecté pourrait modifier la transaction d'un autre en changeant l'id dans l'URL — par exemple `DELETE /api/transactions/42` alors que la transaction 42 appartient à quelqu'un d'autre. Mon middleware `ownerGuard` vérifie en base que la transaction ciblée appartient bien à l'utilisateur extrait du JWT. Si ce n'est pas le cas, on retourne un 403 Forbidden."

## Q5 : "Quels tests avez-vous mis en place ?"
> "J'ai mis en place des tests d'intégration sur les routes d'authentification avec Jest et Supertest. 10 cas de test couvrant les inscriptions, connexions et vérification de tokens. La base de données est mockée pour isoler les tests. Le backend est aussi couvert par des tests sur le middleware d'authentification. Les rapports de couverture sont générés au format lcov et envoyés à SonarCloud."

## Q6 : "Comment avez-vous déployé votre application ?"
> "L'application est entièrement containerisée avec Docker. Chaque service a son propre container : frontend Next.js, backend Express, PostgreSQL et MongoDB. Docker Compose orchestre le tout. Les containers sont publiés sur Docker Hub. Les healthchecks garantissent que les bases de données sont prêtes avant que le backend ne démarre. En production, un reverse proxy Nginx gère le routage HTTPS."

## Q7 : "Qu'auriez-vous fait différemment ?"
> "Avec plus de temps, j'aurais mis en place une vraie pipeline CI/CD avec GitHub Actions pour automatiser les tests et le déploiement à chaque push. J'aurais aussi ajouté une couche de cache Redis pour les statistiques du dashboard, et implémenté le refresh token pour améliorer l'expérience de reconnexion automatique. La couverture de tests frontend avec Testing Library aurait aussi été un plus."

## Q8 : "Expliquez le questionnaire et comment il personalise l'expérience"
> "Le questionnaire est un composant React en 7 étapes qui collecte le profil de l'utilisateur : type de profil, situation familiale, tranche de revenus, dettes, objectifs d'épargne, catégories prioritaires. Les réponses sont sauvegardées en base via un upsert PostgreSQL. La dernière étape affiche un récapitulatif et des conseils financiers personnalisés générés dynamiquement par la fonction `generateAdvice()`. Ce profil permet ensuite d'adapter le dashboard et les recommandations."

---

---

# VEILLE TECHNOLOGIQUE — À mentionner si le jury pose la question

## Sujets de veille effectuée :

**1. Next.js App Router vs Pages Router**
> "Next.js 13+ introduit l'App Router basé sur les React Server Components. J'ai suivi son évolution et fait le choix délibéré de l'utiliser car il améliore les performances avec le rendu serveur et simplifie le routing."

**2. Sécurité JWT — Meilleures pratiques 2024**
> "J'ai suivi les recommandations OWASP sur le stockage des tokens. Le débat localStorage vs httpOnly cookie est connu. J'ai utilisé localStorage pour la simplicité du MVP, mais en production une migration vers httpOnly cookies est prévue pour une meilleure protection XSS."

**3. PostgreSQL 16 — Nouvelles fonctionnalités**
> "PostgreSQL 16 apporte des améliorations de performance sur les requêtes parallèles et les indexes. J'ai créé des indexes sur `user_id` et `created_at` pour optimiser les requêtes filtrées par utilisateur."

**4. Docker multi-stage builds**
> "J'ai suivi les évolutions Docker, notamment les multi-stage builds qui permettent de réduire la taille des images de production en séparant les étapes de build et d'exécution."

---

---

# CHECKLIST AVANT LA SOUTENANCE

- [ ] Démo fonctionnelle testée (données de test en place)
- [ ] Application démarrée et accessible
- [ ] Onglets navigateur prêts : app ouverte, VS Code avec le code
- [ ] Postman ouvert avec les routes prêtes (si besoin de montrer l'API)
- [ ] Diagrammes UML/Merise prêts à afficher
- [ ] Timer préparé pour respecter le timing
- [ ] Répétition complète effectuée (minimum 2 fois)

---

*Support créé pour la soutenance CDA — My Smart Budget | Colint School 2025*
