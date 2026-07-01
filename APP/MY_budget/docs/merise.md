# Modèles de données — My Smart Budget

## MCD corrigé (Modèle Conceptuel de Données)

```mermaid
erDiagram

    UTILISATEUR {
        int id_utilisateur PK
        string email
        string password
        string name
        date created_at
    }

    PROFIL {
        int id_profil PK
        int user_id FK
        string profil_type
        float revenu_mensuel
        string situation_familiale
        string objectif_epargne
        date created_at
    }

    CATEGORIE {
        int id_categorie PK
        string nom
        string icone
        string type
    }

    TRANSACTION {
        int id_transaction PK
        int user_id FK
        int categorie_id FK
        string name
        float amount
        date date
        date created_at
    }

    BUDGET {
        int id_budget PK
        int user_id FK
        int categorie_id FK
        float limit
        date created_at
        date updated_at
    }

    OBJECTIF {
        int id_objectif PK
        int user_id FK
        string name
        string icon
        float target
        float current_amount
        date deadline
        date created_at
    }

    RAPPORT {
        string id_rapport PK
        string user_id
        string titre
        string description
        string type
        string data
        date created_at
    }

    UTILISATEUR ||--o| PROFIL       : "possède (1,1 - 0,1)"
    UTILISATEUR ||--o{ TRANSACTION  : "effectue (1,1 - 0,N)"
    UTILISATEUR ||--o{ BUDGET       : "définit (1,1 - 0,N)"
    UTILISATEUR ||--o{ OBJECTIF     : "planifie (1,1 - 0,N)"
    UTILISATEUR ||--o{ RAPPORT      : "génère (1,1 - 0,N)"
    CATEGORIE   ||--o{ TRANSACTION  : "classifie (1,1 - 0,N)"
    CATEGORIE   ||--o{ BUDGET       : "concerne (1,1 - 0,N)"
```

---

## Erreurs corrigées par rapport à la version précédente

| ❌ Ancien (incorrect) | ✅ Nouveau (correct) |
|---|---|
| `Objectif.id_profil` (PK) | `Objectif.id_objectif` (PK) + `user_id` (FK) |
| `transactions.id_budget` | Supprimé — transactions → catégorie, pas → budget |
| `category` avait les champs de `budget` | `CATEGORIE` a ses propres champs : nom, icone, type |
| Relation "encadre" budget→transactions | Supprimée — elle était fausse |
| Relation "définit" entre category et budget | Renommée "concerne" pour plus de clarté |

---

## MLD (Modèle Logique de Données)

```mermaid
erDiagram

    users {
        int id PK
        varchar email UK
        varchar password
        varchar name
        timestamp created_at
    }

    user_profiles {
        int id PK
        int user_id FK
        varchar profile_type
        float revenus_mensuels
        varchar situation_familiale
        varchar objectif_epargne
        timestamp created_at
    }

    categories {
        int id PK
        varchar nom UK
        varchar icone
        varchar type
    }

    transactions {
        int id PK
        int user_id FK
        int categorie_id FK
        varchar name
        float amount
        varchar type
        date date
        timestamp created_at
    }

    budgets {
        int id PK
        int user_id FK
        int categorie_id FK
        float limit
        timestamp created_at
        timestamp updated_at
    }

    objectifs {
        int id PK
        int user_id FK
        varchar name
        varchar icon
        float target
        float current_amount
        date deadline
        timestamp created_at
    }

    reports {
        string id PK
        string user_id
        string titre
        string description
        string type
        string data
        timestamp created_at
    }

    users        ||--o| user_profiles : "user_id"
    users        ||--o{ transactions  : "user_id"
    users        ||--o{ budgets       : "user_id"
    users        ||--o{ objectifs     : "user_id"
    users        ||--o{ reports       : "user_id"
    categories   ||--o{ transactions  : "categorie_id"
    categories   ||--o{ budgets       : "categorie_id"
```

---

## MPD (Modèle Physique de Données — PostgreSQL)

```mermaid
erDiagram

    users {
        SERIAL id PK
        VARCHAR email "NOT NULL UNIQUE"
        VARCHAR password "NOT NULL"
        VARCHAR name "NOT NULL"
        TIMESTAMP created_at "DEFAULT NOW()"
    }

    user_profiles {
        SERIAL id PK
        INTEGER user_id FK "UNIQUE REFERENCES users ON DELETE CASCADE"
        VARCHAR profile_type
        NUMERIC revenus_mensuels
        VARCHAR situation_familiale
        TIMESTAMP created_at "DEFAULT NOW()"
    }

    categories {
        SERIAL id PK
        VARCHAR nom "NOT NULL UNIQUE"
        VARCHAR icone "DEFAULT 💸"
        VARCHAR type "CHECK depense revenu les_deux"
    }

    transactions {
        SERIAL id PK
        INTEGER user_id FK "REFERENCES users ON DELETE CASCADE"
        INTEGER categorie_id FK "REFERENCES categories ON DELETE SET NULL"
        VARCHAR name "NOT NULL"
        NUMERIC amount "NOT NULL"
        DATE date "DEFAULT CURRENT_DATE"
        TIMESTAMP created_at "DEFAULT NOW()"
    }

    budgets {
        SERIAL id PK
        INTEGER user_id FK "REFERENCES users ON DELETE CASCADE"
        INTEGER categorie_id FK "REFERENCES categories ON DELETE SET NULL"
        NUMERIC limit "NOT NULL"
        TIMESTAMP created_at "DEFAULT NOW()"
        TIMESTAMP updated_at
    }

    objectifs {
        SERIAL id PK
        INTEGER user_id FK "REFERENCES users ON DELETE CASCADE"
        VARCHAR name "NOT NULL"
        VARCHAR icon "DEFAULT 🎯"
        NUMERIC target "NOT NULL"
        NUMERIC current_amount "DEFAULT 0"
        DATE deadline
        TIMESTAMP created_at "DEFAULT NOW()"
    }

    users        ||--o| user_profiles : "CASCADE DELETE"
    users        ||--o{ transactions  : "CASCADE DELETE"
    users        ||--o{ budgets       : "CASCADE DELETE"
    users        ||--o{ objectifs     : "CASCADE DELETE"
    categories   ||--o{ transactions  : "SET NULL"
    categories   ||--o{ budgets       : "SET NULL"
```

---

## Légende

| Symbole | Signification |
|---|---|
| `\|\|` | Exactement un (obligatoire) |
| `o\|` | Zéro ou un (optionnel) |
| `o{` | Zéro ou plusieurs |
| `PK` | Clé primaire |
| `FK` | Clé étrangère |
| `UK` | Contrainte d'unicité |
