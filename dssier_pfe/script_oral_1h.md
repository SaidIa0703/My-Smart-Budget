# Script oral — My Smart Budget | CDA | ~1h

> **Convention de lecture :**
> *(pause)* = marquer une pause de 2-3 secondes
> **[action]** = geste ou action à faire
> Les blocs en anglais sont à dire en anglais, le reste en français.

---

## SLIDE 1 — INTRODUCTION EN ANGLAIS (~5 min)

**[Regarder le jury, sourire, se tenir droit]**

Good morning, and thank you for having me today.

My name is Abdel, and I am a student in the CDA program — Concepteur Développeur d'Applications — at Colint School.

*(pause)*

Today, I am going to present **My Smart Budget** — a full-stack web application that I designed, developed, and deployed entirely during my work-study program.

*(pause)*

To give you a quick overview of the project, I will use the **QQOQCP framework**.

*(pause)*

**WHO?** — The target users are individuals who want to take control of their personal finances. More specifically: students who are managing a budget for the first time, employees who want to track their monthly expenses, and families who need to manage shared finances.

*(pause)*

**WHAT?** — My Smart Budget is a web application that allows users to track their income and expenses, manage budgets by category, set savings goals, and visualize their spending through interactive charts and reports.

*(pause)*

**WHERE?** — The application is accessible via any web browser. It is deployed online using Docker containers, with a backend API and two databases running on a cloud server.

*(pause)*

**WHEN?** — The project was developed over approximately six months, from the initial design phase all the way to the final deployment. It covers the full software development lifecycle.

*(pause)*

**HOW?** — I built the application using **Next.js 15** for the frontend, **Node.js and Express** for the REST API backend, **PostgreSQL** for relational and transactional data, and **MongoDB** for analytical reports.

*(pause)*

**WHY?** — Because many people struggle to manage their money without the right tools. Existing applications are either too complex or too generic. My Smart Budget provides a simple, personalized, and secure experience, adapted to the user's profile, to help them make better financial decisions every day.

*(pause)*

Now, I will switch to French for the rest of the presentation.

---

## SLIDE 2 — PRÉSENTATION DU PROJET (~5 min)

**[Passer au slide suivant]**

Merci. Donc, revenons sur le contexte du projet.

La problématique de départ est simple mais concrète : **beaucoup de gens ne savent pas où va leur argent**. Ils ont des revenus, des dépenses, mais ils n'ont pas de visibilité claire sur leur situation financière réelle.

*(pause)*

Les applications existantes sur le marché — type Bankin ou Lydia — sont souvent soit trop complexes, soit trop génériques. Elles ne s'adaptent pas au profil de l'utilisateur.

C'est là l'idée centrale de My Smart Budget : **une application personnalisée**, qui s'adapte dès le départ selon que vous êtes étudiant, salarié ou en famille.

*(pause)*

Pour cadrer les objectifs du projet, j'ai utilisé la méthode **SMART** :

- **Spécifique** : une application web de gestion budgétaire multi-profil, avec des dashboards distincts selon le type d'utilisateur.
- **Mesurable** : une API REST fonctionnelle, des tests automatisés qui passent en CI, et un déploiement Docker opérationnel.
- **Atteignable** : j'ai choisi une stack que je maîtrisais — Next.js, Node.js, PostgreSQL — pour pouvoir aller au bout.
- **Réaliste** : le MVP a été livré dans les délais, avec toutes les fonctionnalités core opérationnelles.
- **Temporel** : développé dans le cadre de mon alternance CDA 2024-2025, soit environ six mois.

*(pause)*

Les fonctionnalités principales de l'application sont :

D'abord, l'**inscription et la connexion sécurisée** avec des tokens JWT. Ensuite, un **questionnaire d'onboarding en 7 étapes** qui permet de personnaliser l'expérience dès la première connexion. Puis un **dashboard avec des statistiques en temps réel**, une **gestion complète des transactions** — c'est-à-dire créer, modifier, supprimer — des **budgets par catégorie** avec des alertes visuelles, des **objectifs d'épargne**, et enfin des **rapports analytiques** stockés dans MongoDB.

*(pause)*

Voilà pour le contexte. Passons maintenant à la méthode de travail que j'ai utilisée.

---

## SLIDE 3 — MÉTHODOLOGIE & ORGANISATION (~5 min)

**[Passer au slide suivant]**

Pour organiser mon travail sur six mois, j'ai appliqué une **méthode Agile adaptée au développement solo**.

Concrètement, ça veut dire que j'ai découpé le projet en **sprints de une à deux semaines**, avec un backlog priorisé. À chaque sprint, je définissais les tâches à accomplir, je développais, et je faisais une mini-rétrospective pour ajuster la suite.

*(pause)*

Côté outils, voici ceux que j'ai utilisés tout au long du projet :

**GitHub** pour le versioning. J'ai travaillé avec des branches dédiées par fonctionnalité — par exemple `feat/transactions` ou `fix/profile` — et des commits en **conventional commits** : `feat`, `fix`, `docs`, `refactor`. Chaque merge sur `main` déclenchait automatiquement une analyse qualité.

**VS Code** comme IDE principal, avec les extensions TypeScript et ESLint.

**Docker** pour la containerisation, à la fois en local et en production.

**SonarCloud** pour l'analyse en continu de la qualité du code — couverture de tests, duplications, code smells.

**Postman** pour tester les routes API pendant le développement, avant d'intégrer le frontend.

Et **draw.io** pour les diagrammes UML et Merise.

*(pause)*

Pour vous donner un exemple concret de sprint : le Sprint 3 était dédié à l'authentification. L'objectif était de créer les routes `/register` et `/login`, d'implémenter le middleware JWT, d'écrire les tests unitaires avec Jest et Supertest, et d'intégrer le formulaire de connexion côté frontend. Ce sprint a duré environ dix jours.

*(pause)*

Cette organisation m'a permis d'avancer de façon structurée, sans me perdre dans des détails techniques trop tôt, et de livrer un MVP complet et fonctionnel.

*(pause)*

Passons maintenant à la partie conception — architecture, cas d'utilisation, et base de données.

---

## SLIDE 4 — CONCEPTION FONCTIONNELLE & BDD (~10 min)

**[Passer au slide suivant]**

La conception, c'est l'étape que je considère comme la plus importante du projet. Un mauvais choix d'architecture au début, ça coûte très cher à corriger ensuite.

*(pause)*

### Architecture 3 tiers

Mon application respecte strictement l'**architecture 3 tiers**.

La **couche présentation**, c'est le frontend Next.js. Elle affiche les données, gère les interactions utilisateur, et ne contient aucune logique métier.

La **couche métier**, c'est l'API REST Express. Toute la logique applicative est là : validation des données, authentification, calculs. Le frontend ne fait qu'appeler l'API.

La **couche accès aux données**, c'est là qu'on parle aux bases de données — via `pg-promise` pour PostgreSQL et `Mongoose` pour MongoDB.

*(pause)*

Cette séparation stricte a plusieurs avantages : on peut tester chaque couche indépendamment, remplacer le frontend sans toucher au backend, et faire évoluer les bases de données sans impacter l'interface.

*(pause)*

### Cas d'utilisation

J'ai identifié **deux acteurs principaux** dans l'application.

L'**utilisateur non connecté** peut uniquement s'inscrire ou se connecter. C'est tout. Il n'a accès à rien d'autre.

L'**utilisateur connecté** a accès à tout : il remplit d'abord le questionnaire de profil à sa première connexion, puis il peut consulter son dashboard, ajouter, modifier ou supprimer des transactions, gérer ses budgets par catégorie, définir ses objectifs d'épargne, consulter ses rapports, et modifier les paramètres de son profil.

*(pause)*

### Diagramme de séquence — Authentification

Je vais vous présenter le flux d'authentification en détail, car c'est une bonne illustration de comment frontend et backend communiquent.

Quand un utilisateur soumet le formulaire d'inscription, le frontend envoie une requête `POST /api/auth/register` avec l'email, le nom et le mot de passe dans le body.

Le backend reçoit la requête. Il vérifie d'abord que l'email n'existe pas déjà en base, avec un `SELECT`. Si l'email est libre, il **hashe le mot de passe avec bcrypt** — le mot de passe en clair ne touche jamais la base de données. Ensuite, il insère l'utilisateur, récupère son `id`, génère un **token JWT** signé avec le secret d'environnement, et renvoie le token au frontend.

Le frontend stocke ce token dans le localStorage et l'envoie dans le header `Authorization: Bearer <token>` à chaque requête protégée.

*(pause)*

Ce choix du JWT me permet d'avoir une API **stateless** : le serveur n'a pas besoin de gérer des sessions. Chaque requête est autonome.

*(pause)*

### Conception de la base de données

J'ai fait le choix d'utiliser **deux bases de données complémentaires**, et c'est un choix architecturalque je vais justifier.

**PostgreSQL** pour toutes les données relationnelles et transactionnelles. La table `users` stocke les informations d'authentification. La table `transactions` est liée à `users` par une clé étrangère avec `CASCADE DELETE` — si un utilisateur est supprimé, toutes ses transactions le sont aussi automatiquement. La table `budgets` stocke les plafonds de dépenses par catégorie. Et la table `user_profiles` stocke les réponses au questionnaire.

*(pause)*

J'ai utilisé le type `DECIMAL(10,2)` pour les montants — et non pas `FLOAT` — parce que DECIMAL garantit une précision exacte pour les calculs financiers. C'est un choix délibéré.

*(pause)*

**MongoDB** pour les rapports analytiques. La raison est simple : la structure d'un rapport peut évoluer. Aujourd'hui il contient un titre, une description, un type. Demain on pourrait y ajouter des graphiques sérialisés, des métriques supplémentaires. Avec MongoDB, on peut faire ça sans migration de schéma. C'est ce qu'on appelle le pattern **polyglot persistence** : utiliser la base de données la plus adaptée à chaque type de données.

*(pause)*

Ce choix est documenté dans mon projet. Si le jury me demande pourquoi deux BDD, c'est exactement cette réponse que je donne.

*(pause)*

Passons maintenant à la démonstration live de l'application.

---

## SLIDE 5 — DÉMONSTRATION (~8 min)

**[Ouvrir le navigateur sur l'application]**

Je vais vous faire une démonstration de l'application en conditions réelles.

*(pause)*

### Page de connexion

**[Afficher la page de login]**

Voilà la page de connexion. Le design est épuré, entièrement responsive — ça fonctionne aussi bien sur mobile que sur desktop. Le style est fait avec Tailwind CSS.

Je me connecte avec un compte de test.

**[Entrer les identifiants et se connecter]**

*(pause)*

### Questionnaire d'onboarding

**[Si redirection vers le questionnaire, le montrer]**

À la première connexion, l'utilisateur est guidé par ce questionnaire en 7 étapes. L'objectif est de collecter le profil de l'utilisateur pour personnaliser son expérience.

Étape 1 : le type de profil — étudiant, salarié, ou famille.

**[Cliquer sur "Salarié"]**

Étape 3 : les revenus mensuels, par tranche.

Étape 5 : les objectifs d'épargne — vacances, immobilier, retraite, fonds d'urgence...

Et la dernière étape affiche un récapitulatif avec des **conseils financiers personnalisés**, générés dynamiquement selon les réponses. Par exemple, si le profil est "salarié" avec un objectif immobilier, on recommande d'épargner 20% des revenus.

*(pause)*

Ces données sont sauvegardées en base via un `UPSERT` PostgreSQL — j'y reviendrai dans la partie backend.

*(pause)*

### Dashboard

**[Afficher le dashboard]**

Voilà le tableau de bord. On voit en haut les trois KPIs principaux : total des revenus, total des dépenses, et solde. Ces chiffres sont calculés en temps réel depuis les transactions en base.

En dessous, deux graphiques Recharts : un camembert pour la répartition des dépenses par catégorie, et un graphique en barres pour visualiser les catégories les plus coûteuses.

Et enfin les trois dernières transactions avec un lien vers la liste complète.

*(pause)*

### Transactions — CRUD

**[Naviguer vers la page des transactions]**

Ici la gestion des transactions. On voit la liste complète avec les filtres de recherche et le filtre par catégorie.

**[Cliquer sur "Ajouter"]**

Je crée une nouvelle transaction : description "Courses Leclerc", catégorie "Alimentation", montant -45 euros — le signe négatif indique que c'est une dépense. Un montant positif serait un revenu.

**[Valider le formulaire]**

La transaction apparaît immédiatement dans la liste et les KPIs du dashboard se mettent à jour.

**[Montrer le bouton de suppression]**

Je peux aussi supprimer une transaction. Chaque action est sécurisée côté backend — je reviendrai là-dessus.

*(pause)*

### Budgets

**[Naviguer vers les budgets]**

La page des budgets affiche les plafonds de dépenses par catégorie avec des barres de progression. Les couleurs changent selon le niveau de consommation : vert en dessous de 70%, orange entre 70 et 90%, rouge au-delà. Une bannière en haut affiche le **reste à vivre total** — c'est-à-dire la somme restante sur tous les budgets combinés.

*(pause)*

Voilà pour la démo. Passons maintenant aux détails techniques.

---

## SLIDE 6 — CODE FRONTEND (~7 min)

**[Passer au slide code frontend]**

Je vais maintenant vous présenter les points techniques les plus importants du frontend.

*(pause)*

Le frontend est développé en **Next.js 15** avec **React 19** et **TypeScript**. J'utilise l'**App Router** de Next.js, qui est basé sur le système de fichiers : chaque dossier dans `/app` correspond à une route. Tailwind CSS gère le style, Recharts les graphiques.

*(pause)*

### Point technique 1 — Le questionnaire (questionnaire.tsx)

Le composant de questionnaire est l'un des plus complexes du projet. Il gère 7 étapes avec un état local React. La logique de validation par étape est encapsulée dans une fonction `canNext()` :

```tsx
const canNext = () => {
  if (step === 1) return !!answers.profileType;
  if (step === 3) return !!answers.revensuMensuels;
  if (step === 5) return answers.objectifsEpargne.length > 0;
  return true;
};
```

Cette fonction retourne `true` uniquement si les données de l'étape courante sont valides. Le bouton "Suivant" est désactivé tant que `canNext()` retourne `false`. C'est une validation progressive qui guide l'utilisateur sans l'agresser avec un formulaire entier à valider d'un coup.

*(pause)*

### Point technique 2 — Protection des routes côté client

Chaque page protégée contient un `useEffect` qui vérifie la présence du token au montage du composant. Si le token est absent, l'utilisateur est redirigé vers `/login` immédiatement :

```tsx
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) router.push('/login');
}, []);
```

C'est la protection **côté client**. Mais attention — ça ne remplace pas la protection côté serveur. Le vrai rempart, c'est le backend qui valide le token à chaque requête.

*(pause)*

### Point technique 3 — Le hook useProfileDashboard

J'ai créé un **custom hook** qui centralise toute la logique du dashboard : la récupération des transactions, le calcul des statistiques, la gestion des formulaires, la gestion des objectifs.

Ça permet d'avoir des pages légères — la page `salarie/page.tsx` n'est que du JSX, toute la logique est dans le hook. C'est le pattern **séparation des préoccupations** appliqué aux hooks React.

*(pause)*

### Point technique 4 — Architecture des pages

L'architecture suit le principe de **colocation** de Next.js : chaque route est un dossier avec son `page.tsx`. J'ai des profils distincts — étudiant, salarié, famille, jeune, adulte, senior — chacun avec sa propre page et son propre dashboard personnalisé.

Les composants réutilisables comme `ProfileSection` et `GoalsSection` sont partagés entre tous les profils via des props, ce qui évite la duplication de code.

*(pause)*

Passons maintenant au backend.

---

## SLIDE 7 — CODE BACKEND & API REST (~7 min)

**[Passer au slide backend]**

Le backend est une **API REST en Node.js avec Express**. Elle expose une vingtaine d'endpoints organisés par domaine fonctionnel.

*(pause)*

### Architecture des routes

Les routes sont organisées en fichiers séparés par domaine : `auth.js`, `transactions.js`, `budgets.js`, `goals.js`, `profile.js`, `reports.js`. Chaque fichier est un Router Express monté dans `index.js` avec un préfixe de chemin.

*(pause)*

### Point technique 1 — userId toujours extrait du JWT

C'est **le choix de sécurité le plus important du projet**. Je n'accepte jamais le `userId` depuis le corps de la requête. Il est toujours extrait du token JWT décodé par le middleware d'authentification :

```js
router.post('/add', async (req, res) => {
  const userId = req.user.userId; // extrait du JWT, jamais du body
  const { name, category, amount, date } = req.body;
  // ...
});
```

Pourquoi c'est important ? Parce que si on acceptait le `userId` depuis le body, n'importe qui pourrait créer des transactions au nom de quelqu'un d'autre en changeant une valeur. Avec cette approche, l'identité de l'utilisateur est garantie par le token signé — elle ne peut pas être falsifiée.

*(pause)*

### Point technique 2 — Agrégation SQL optimisée

La route `/stats` effectue une requête SQL avec **agrégation conditionnelle**. Au lieu de récupérer toutes les transactions et de faire le calcul en JavaScript, je laisse PostgreSQL faire le travail :

```sql
SELECT
  SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_revenus,
  SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_depenses,
  COUNT(*) as total_transactions
FROM transactions
WHERE user_id = $1 AND date >= NOW() - INTERVAL '1 month'
```

Une seule requête pour avoir revenus, dépenses et nombre de transactions du dernier mois. C'est beaucoup plus efficace que de charger toutes les transactions en mémoire.

*(pause)*

### Point technique 3 — UPSERT PostgreSQL pour le profil

Pour sauvegarder le profil utilisateur, j'utilise un `INSERT ... ON CONFLICT DO UPDATE` — ce qu'on appelle un **UPSERT**. Si le profil n'existe pas encore, il est créé. S'il existe déjà, il est mis à jour. Une seule requête, sans avoir à vérifier au préalable si la ligne existe.

```sql
INSERT INTO user_profiles (user_id, profile_type, ...)
VALUES ($1, $2, ...)
ON CONFLICT (user_id) DO UPDATE SET
  profile_type = $2, revenus_mensuels = $3, ...
```

*(pause)*

### Point technique 4 — Fail-fast au démarrage

Dans `db.js`, je valide la présence de toutes les variables d'environnement au démarrage du serveur. Si `JWT_SECRET` ou `DATABASE_URL` est manquant, le processus s'arrête immédiatement avec une erreur explicite.

C'est le pattern **fail-fast** : mieux vaut ne pas démarrer du tout que démarrer avec une configuration incomplète et découvrir le problème en production.

*(pause)*

Passons maintenant à un sujet qui me tient à cœur : la sécurité.

---

## SLIDE 8 — SÉCURITÉ APPLICATIVE (~5 min)

**[Passer au slide sécurité]**

La sécurité, c'est un axe que j'ai pris très au sérieux dès le début du projet. Je vais vous présenter les six couches de protection que j'ai mises en place.

*(pause)*

**Première couche : Authentification JWT + bcrypt.**

Les mots de passe sont **jamais stockés en clair**. Ils sont hashés avec bcrypt, avec un salt factor de 10. L'authentification utilise des tokens JWT signés avec un secret d'environnement, avec une expiration de 7 jours.

*(pause)*

**Deuxième couche : Helmet — les en-têtes HTTP sécurisés.**

Helmet est un middleware Express qui ajoute automatiquement des headers de sécurité sur toutes les réponses : Content-Security-Policy, X-Frame-Options, X-Content-Type-Options. J'ai aussi désactivé le header `X-Powered-By` pour ne pas exposer la technologie utilisée au serveur.

*(pause)*

**Troisième couche : Rate Limiting — protection contre le brute force.**

Sur les routes d'authentification, j'ai un rate limiter : maximum 20 tentatives sur une fenêtre de 15 minutes. Au-delà, la requête est rejetée avec un message clair. Ça empêche quelqu'un d'essayer des millions de combinaisons de mots de passe par script.

*(pause)*

**Quatrième couche : Protection IDOR — le middleware ownerGuard.**

C'est le point de sécurité dont je suis le plus fier. IDOR signifie **Insecure Direct Object Reference**. Sans protection, un utilisateur authentifié pourrait modifier la transaction d'un autre utilisateur simplement en changeant l'ID dans l'URL — par exemple `DELETE /api/transactions/42` alors que la transaction 42 appartient à quelqu'un d'autre.

Mon middleware `ownerGuard` s'exécute avant chaque modification ou suppression. Il vérifie en base que la ressource ciblée appartient bien à l'utilisateur extrait du JWT. Si ce n'est pas le cas, on retourne un **403 Forbidden** — pas de message d'erreur explicite pour ne pas donner d'informations à un attaquant.

*(pause)*

**Cinquième couche : Validation des entrées.**

Tous les champs sont validés côté backend. Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre — validé par regex. La taille du body JSON est limitée à 10kb pour éviter les payloads abusifs.

*(pause)*

**Sixième couche : CORS configuré.**

Le CORS n'autorise que les origines explicitement déclarées en variable d'environnement. En production, seul le domaine de l'application est autorisé. En développement, uniquement `localhost:3000`.

*(pause)*

Ces six couches couvrent les principales vulnérabilités OWASP Top 10 : injection, authentification cassée, exposition de données sensibles, et IDOR.

*(pause)*

Parlons maintenant des tests.

---

## SLIDE 9 — TESTS & QUALITÉ (~4 min)

**[Passer au slide tests]**

Pour garantir la qualité du code, j'ai mis en place une stratégie de tests et d'analyse continue.

*(pause)*

J'ai appliqué la **pyramide des tests**. La base est constituée de tests unitaires et d'intégration avec **Jest**. Pour le backend, j'utilise **Supertest** qui permet de tester les routes HTTP directement, sans avoir à lancer un vrai serveur.

*(pause)*

Sur les routes d'authentification, j'ai **10 cas de test** qui couvrent à la fois les cas nominaux et les cas d'erreur :

- Inscription avec champs manquants → 400
- Inscription avec mot de passe trop faible → 400
- Inscription avec un email déjà utilisé → 400
- Inscription réussie → 201 avec un token
- Connexion avec champs manquants → 400
- Connexion avec un email inexistant → 401
- Connexion avec un mauvais mot de passe → 401
- Connexion réussie → 200 avec un token
- Vérification de token manquant → 401
- Vérification de token valide → 200 avec `valid: true`

*(pause)*

Un point important sur l'**isolation des tests** : la base de données est mockée avec `jest.mock('../db')`. Aucune connexion réelle à PostgreSQL n'est requise pour faire tourner la suite de tests. Chaque test repart d'un état propre grâce à `beforeEach(() => jest.clearAllMocks())`.

*(pause)*

Côté frontend, j'ai des tests avec **React Testing Library** sur les composants clés : le formulaire d'authentification, la liste des transactions, et les pages principales.

*(pause)*

Pour l'analyse en continu, **SonarCloud** scanne le code à chaque push sur `main`. Les rapports de couverture au format lcov sont envoyés automatiquement. SonarCloud remonte les code smells, les duplications, et les vulnérabilités potentielles.

*(pause)*

Terminons avec le déploiement.

---

## SLIDE 10 — DÉPLOIEMENT & DEVOPS (~4 min)

**[Passer au slide déploiement]**

L'ensemble de l'application est **containerisée avec Docker**. Ça veut dire que n'importe qui peut déployer My Smart Budget sur n'importe quelle machine avec une seule commande : `docker compose up`.

*(pause)*

Le fichier `docker-compose.yml` orchestre quatre services :

- `frontend` sur le port 3000 — l'application Next.js
- `backend` sur le port 5001 — l'API Express
- `postgres:16-alpine` sur le port 5432
- `mongo:7` sur le port 27017

*(pause)*

Un détail technique important : les services PostgreSQL et MongoDB ont des **healthchecks configurés**. Le backend est configuré avec `depends_on: condition: service_healthy`. Ça garantit que le backend ne démarre que quand les deux bases de données sont prêtes à accepter des connexions. Sans ça, on risque des crashs au démarrage si le backend essaie de se connecter avant que la BDD soit initialisée.

*(pause)*

J'ai publié mes images Docker sur **Docker Hub** : `abedel/my-smart-budget-backend` et `abedel/my-smart-budget-frontend`. Elles sont construites en **multi-stage build** pour réduire la taille des images de production.

*(pause)*

Toutes les données sensibles — mot de passe de la base, `JWT_SECRET`, URL MongoDB — sont injectées via des **variables d'environnement**. Elles ne sont jamais hardcodées dans le code source, et le fichier `.env` est dans `.gitignore`.

*(pause)*

Tous les services partagent un **réseau bridge interne** Docker. Le frontend appelle le backend par son nom de service — `backend` — et non par `localhost`. C'est la bonne pratique pour les environnements containerisés.

*(pause)*

En production, l'application est accessible à l'adresse `https://smarterbudget.net`.

---

## CONCLUSION (~incluse dans le temps)

**[Passer au slide conclusion]**

Pour conclure, ce projet m'a permis de mettre en pratique l'ensemble des compétences du titre CDA, sur les trois blocs de compétences.

*(pause)*

**CCP1 — Développement d'une application** : j'ai développé une interface utilisateur complète en Next.js, des composants backend en Node.js et Express, et j'ai géré l'ensemble du projet avec Git et une méthode Agile.

**CCP2 — Conception de la solution** : j'ai conçu l'architecture logicielle 3 tiers, modélisé et implémenté une base de données relationnelle PostgreSQL avec un schéma complet, et utilisé MongoDB comme base NoSQL pour les rapports analytiques.

**CCP3 — Préparation et mise en production** : j'ai mis en place des tests automatisés avec Jest et Supertest, déployé l'application avec Docker Compose, et configuré l'analyse qualité continue avec SonarCloud.

*(pause)*

Les **principales difficultés** que j'ai rencontrées sont la gestion de la double connexion aux bases de données — s'assurer que PostgreSQL et MongoDB étaient bien initialisés au démarrage — et la mise en place de la protection IDOR, qui demande une réflexion en termes de sécurité que je n'avais pas encore pleinement développée avant ce projet.

Ces challenges m'ont permis d'approfondir ma compréhension de la sécurité applicative et des architectures distribuées.

*(pause)*

Je suis maintenant disponible pour répondre à vos questions.

---

## RÉPONSES AUX QUESTIONS DU JURY

*(À utiliser si les questions arrivent. Ne pas lire, juste avoir en tête.)*

**Q : "Expliquez l'architecture 3 tiers"**
→ 3 couches séparées. Présentation = Next.js, affiche et interagit. Métier = Express API, logique, validation, sécurité. Persistance = PostgreSQL + MongoDB. Chaque couche ne connaît que la couche immédiatement en dessous.

**Q : "Pourquoi deux bases de données ?"**
→ Pattern polyglot persistence. PostgreSQL pour l'intégrité référentielle des données financières (clés étrangères, DECIMAL). MongoDB pour la flexibilité de schéma des rapports analytiques — leur structure peut évoluer sans migration.

**Q : "C'est quoi une attaque IDOR ?"**
→ Changer un ID dans une URL pour accéder à des ressources d'un autre utilisateur. Mon ownerGuard vérifie en base que la ressource appartient à l'utilisateur du JWT avant toute modification.

**Q : "localStorage vs httpOnly cookie pour le JWT ?"**
→ J'ai utilisé localStorage pour la simplicité du MVP. Le risque XSS est réel. En production, la migration vers httpOnly cookies est prévue — le token ne serait plus accessible en JavaScript, ce qui élimine ce vecteur d'attaque.

**Q : "Qu'auriez-vous fait différemment ?"**
→ Une vraie pipeline CI/CD avec GitHub Actions pour déployer automatiquement à chaque merge. Un cache Redis pour les statistiques du dashboard. Du refresh token pour la reconnexion automatique. Une meilleure couverture de tests frontend.
