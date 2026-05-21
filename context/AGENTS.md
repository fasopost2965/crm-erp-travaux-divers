# AGENTS.md - Règles et conventions de l'équipe d'agents IA

Bienvenue sur le projet de CRM/ERP de travaux divers pour le marché marocain. En tant qu'agent de développement IA sur ce projet, vous devez respecter scrupuleusement les conventions ci-dessous.

## 1. Principes fondamentaux

- **Qualité de production** : Le code écrit doit être propre, typé (quand possible), commenté en français et optimisé.
- **Respect du cadre (Scope)** : Ne créez pas de fonctionnalités en dehors du MVP spécifié dans `master-brief.md` sans validation.
- **Régularité des mises à jour** :
  - Mettez à jour `context/state.md` après chaque changement majeur.
  - Enregistrez les choix d'architecture ou de packages dans `context/decisions.md`.
  - Suivez l'avancement dans `context/tasks.md`.

## 2. Standards techniques (Laravel 11.x)

- **Modèles et Relations** :
  - Utilisez le strict typing.
  - Déclarez explicitement les relations Eloquent et documentez-les avec des commentaires de type PHPdoc.
  - Utilisez des clés étrangères explicites et des contraintes d'intégrité en base de données (onDelete('cascade'), etc.).
- **Sécurité et Permissions** :
  - Utilisez des **Laravel Policies** pour sécuriser toutes les actions CRUD.
  - Assurez-vous que les requêtes sont filtrées par compte (Tenant/Account) ou par rôle.
- **PostgreSQL** :
  - Évitez le SQL brut (Raw SQL) pour assurer la compatibilité.
  - Indexez les clés de recherche fréquentes (ex: `email`, `status`, `account_id`).

## 3. Workflow de communication

- Les commentaires du code et les documents de gouvernance doivent être rédigés en **Français**.
- Soyez humbles et clairs dans vos résumés d'avancement.
