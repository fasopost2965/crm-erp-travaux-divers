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

---

## 8. Maquettes des écrans clés (Génération Stitch)
- **Décision** : Enregistrer et valider les écrans générés avec Stitch pour maintenir la cohérence de l'interface utilisateur.
- **Date** : 2026-05-21
- **Statut** : En cours
- **Détails des écrans** :
  - **Projet Stitch** : `projects/30868049086750529` ("Moroccan Construction ERP Login")
  - **Charte Graphique** : `assets/b98fa025e9ef45cc859bc734fd35741b` (Police Inter, Bleu primaire #1D4ED8, fond ultra clair #F8FAFC, arrondis 8-12px)
  - **Écrans Validés** :
    1. **Login (Écran 1)** : `projects/30868049086750529/screens/bfc6661dc2f44ffcb37fdef7233b3cf4` (Validation de la maquette Desktop/Mobile existante Atlas Works ERP).
    2. **Dashboard Directeur (Écran 2)** :
       - **Version Desktop** : `projects/30868049086750529/screens/67d08e0e27a2408a8d87921f6e5b94ea` (Titre : "Executive Dashboard - Desktop")
       - **Version Mobile** : `projects/30868049086750529/screens/e9baa92c34274170ba902162cbdf4dd7` (Titre : "Executive Dashboard - Mobile")
    3. **Liste Clients (Écran 3)** :
       - **Version Desktop** : `projects/30868049086750529/screens/915af289e050417d8f065fc13740de97` (Titre : "Client Directory - Atlas Works")
       - **Version Mobile** : `projects/30868049086750529/screens/eaa99d8fefae480d9da07f6216e49140` (Titre : "Clients - Mobile View")
    4. **Fiche Client (Écran 4)** :
       - **Version Desktop** : `projects/30868049086750529/screens/1dd9f27edc97473094664563a955c9be` (Titre : "Client Detail: Casablanca Port Authority")
    5. **Dashboard Commercial (Écran 5)** :
       - **Version Desktop** : `projects/30868049086750529/screens/ea4ae10bf3cd4a4fa597a58ea91b2a29` (Titre : "Commercial Dashboard - Atlas Works")
    6. **Dashboard Chef Chantier (Écran 6)** :
       - **Version Desktop** : `projects/30868049086750529/screens/c7683e346346490eb4f6dd24cf8d6d45` (Titre : "Project Manager Dashboard - Atlas Works")
    7. **Dashboard Finance (Écran 7)** :
       - **Version Desktop** : `projects/30868049086750529/screens/607a8284b78c4f5ba4b2b7e580e7b65b` (Titre : "Financial Overview & Receivables - Atlas Works")
    8. **Devis / Quote Detail (Écran 8)** :
       - **Version Desktop** : `projects/30868049086750529/screens/8a7368f7813c47eebd70b840f86c33d9` (Titre : "Quote Detail: DEV-2026-0084 - Atlas Works")
    9. **Projet / Chantier Detail (Écran 9)** :
       - **Version Desktop** : `projects/30868049086750529/screens/a703c092a8dd4a2ba123522a2176b810` (Titre : "Project Detail: Casablanca Office Renovation - Atlas Works")
    10. **Saisie des heures (Écran 10)** :
        - **Version Mobile** : `projects/30868049086750529/screens/f1e82cdaed0e43caa99b82a33960c740` (Titre : "Log Work Hours - Atlas Works Mobile")
        - **Image Asset** : `projects/30868049086750529/screens/3f863342983c4575bbb6c0f7f8fa9cd1` (Titre : "A professional site photo of drywall installation")
    11. **Facture Detail (Écran 11)** :
        - **Version Desktop** : `projects/30868049086750529/screens/c2fae475b04f4185b53ffefcdccf9f95` (Titre : "Invoice Detail: FAC-2026-0042 - Atlas Works")
