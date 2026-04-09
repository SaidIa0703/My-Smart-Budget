# Guide de contribution — Smart Budget

## Workflow de branches

```
main          ← production (déploiement automatique via CI/CD)
  └── develop ← intégration (branche de base pour les features)
        └── feature/<nom>   ← nouvelle fonctionnalité
        └── fix/<nom>       ← correction de bug
        └── chore/<nom>     ← maintenance, config, docs
```

### Règles

- On ne pousse **jamais directement sur `main`**
- Toute nouvelle fonctionnalité part de `develop` et y revient via PR
- `main` ne reçoit que des merges depuis `develop` une fois la version stabilisée

## Créer une branche

```bash
git checkout develop
git pull origin develop
git checkout -b feature/ma-fonctionnalite
```

## Conventions de commit

Format : `type(scope): description courte`

| Type | Quand l'utiliser |
|------|-----------------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `refactor` | Refactoring sans changement de comportement |
| `chore` | Config, dépendances, CI |
| `docs` | Documentation uniquement |
| `test` | Ajout ou modification de tests |

Exemples :
```
feat(auth): add JWT refresh token endpoint
fix(transactions): prevent IDOR on delete route
chore(ci): add test step before deploy
docs(readme): update API endpoints table
```

**A éviter :** `fix`, `test`, `temp commit`, `save`, `correction`

## Ouvrir une Pull Request

1. Pousser la branche : `git push origin feature/ma-fonctionnalite`
2. Ouvrir une PR sur GitHub vers `develop` (pas `main`)
3. Remplir le template de PR
4. Attendre que la CI passe (tests + SonarCloud)
5. Faire relire par au moins une personne avant de merger

## Lancer les tests localement

```bash
# Backend
cd APP/MY_budget/backend
npm test

# Frontend
cd APP/MY_budget/frontend
npm test
```

## Variables d'environnement

Copier `.env.example` et ne **jamais commiter** le `.env` :

```bash
cp APP/MY_budget/backend/.env.example APP/MY_budget/backend/.env
```
