# DECISIONS.md - Registre des décisions techniques et d'architecture

Ce document trace de façon historique les choix de conception, de technologies et d'implémentation effectués sur le projet.

---

## 1. Choix du Framework et de la Version
- **Décision** : Utiliser **Laravel 11.x** et **PHP 8.3**.
- **Date** : 2026-05-21
- **Statut** : Acté
- **Contexte** : Laravel 11.x apporte des performances accrues, un squelette d'application allégé et des fonctionnalités modernes de gestion des tâches d'arrière-plan et de sécurité. PHP 8.3 est pleinement supporté et installé dans WampServer localement.

---

## 2. Choix de la Base de Données
- **Décision** : Utiliser **PostgreSQL** au lieu de SQLite ou MySQL.
- **Date** : 2026-05-21
- **Statut** : Acté
- **Contexte** : PostgreSQL offre une excellente gestion de la concurrence, des transactions complexes et du typage de données personnalisées, ce qui est parfait pour un ERP gérant des calculs de factures, de devis et des données financières critiques.

---

## 3. Architecture Modulaire Monolithique
- **Décision** : Structurer le code avec un backend robuste et centralisé, organisé par dossiers logiques (Models, Http, Services, Policies, Observers) dans `/code/backend`.
- **Date** : 2026-05-21
- **Statut** : Acté
- **Contexte** : Assure que le code est structuré, respecte les principes SOLID et permet de découpler la logique métier (Services) de la logique de transport (Controllers).

---

## 4. Authentification de l'API
- **Décision** : Utiliser **Laravel Sanctum** pour sécuriser les points de terminaison de l'API.
- **Date** : 2026-05-21
- **Statut** : Acté
- **Contexte** : Fournit un système d'authentification par jeton simple mais robuste et sécurisé pour les applications à page unique (SPA), les applications mobiles et les API basiques.

---

## 5. Rétention des Données (Soft Deletes)
- **Décision** : Activer le trait `SoftDeletes` sur tous les modèles principaux.
- **Date** : 2026-05-21
- **Statut** : Acté
- **Contexte** : Évite les suppressions accidentelles et préserve l'intégrité référentielle des données CRM et financières critiques. Les entités supprimées sont conservées en base de données avec une marque temporelle dans la colonne `deleted_at`.

---

## 6. Relations Polymorphiques pour la Flexibilité du CRM
- **Décision** : Implémenter des relations polymorphiques pour les `activities`, `notes`, `documents` et `tags`.
- **Date** : 2026-05-21
- **Statut** : Acté
- **Contexte** : Permet à ces modèles utilitaires du CRM d'être associés à n'importe quelle entité parente (Comptes, Prospects, Opportunités, Projets) sans avoir à créer de multiples tables pivots spécifiques ou de clés étrangères contraignantes.

---

## 7. Adaptation de l'Environnement Local (MySQL)
- **Décision** : Utiliser **MySQL 9.1** via WAMP pour le bac à sable de développement local, tout en conservant **PostgreSQL** comme cible officielle de production.
- **Date** : 2026-05-21
- **Statut** : Acté
- **Contexte** : Étant donné l'absence de serveur PostgreSQL local et de conteneuriseur Docker sur la machine de développement, l'utilisation de MySQL 9.1 (déjà disponible via WAMP) assure un lancement instantané et fluide des migrations et des tests locaux, sans compromettre la portabilité des schémas d'Eloquent de Laravel.

