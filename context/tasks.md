# TASKS.md - Suivi des tâches de l'ERP/CRM BTP

---

## ✅ DONE : Tâches 1 à 7 (Backend, Maquettes & Setup Frontend)
- [x] **Tâche 1 : Base de Données, Migrations & Seeders**
  - [x] Initialisation de Laravel 11.x et configuration PostgreSQL/MySQL.
  - [x] 28 migrations séquentielles exécutées et validées sans erreur de clé étrangère.
  - [x] Seeder complet avec 8 rôles (`super_admin`, `admin`, `directeur`, `commercial`, `chef_chantier`, `technicien`, `finance`, `rh`).
- [x] **Tâche 2 : Modèles Eloquent & Relations CRM/Ventes/Projets**
  - [x] 26 modèles de base configurés et liés avec relations `camelCase` et SoftDeletes.
- [x] **Tâche 3 : API CRUD & Resource Controllers**
  - [x] 7 contrôleurs RESTful configurés avec FormRequests et sérialisation `camelCase` via API Resources.
- [x] **Tâche 4 : Authentification Sanctum & RBAC**
  - [x] Sécurisation par token Sanctum, middleware de validation de rôles `CheckRole`, et 7 Policies appliquées.
- [x] **Tâche 5 : Opérations Terrain & Pilotage par Rôle**
  - [x] 5 contrôleurs de sous-ressources de chantier imbriquées.
  - [x] Endpoints `/api/dashboard/*` optimisés (directeur, commercial, chef de chantier, finance) avec protection RBAC.
- [x] **Tâche 6 : Conception & Génération des Maquettes Stitch**
  - [x] Établissement de la charte graphique unifiée (Inter, bleu #1D4ED8, fond #F8FAFC, arrondis 8-12px).
  - [x] 13 maquettes interactives générées avec succès (Desktop/Mobile pour dashboards, clients, devis, projets, saisie d'heures et facturation).
- [x] **Tâche 7 : Setup Frontend React/Vite & Intégration API**
  - [x] Initialiser le projet Vite + React dans `/code/frontend` et configurer l'environnement.
  - [x] Installer et configurer Tailwind CSS v4, Axios, React Query et React Router DOM.
  - [x] Mettre en place `AuthContext`, `ProtectedRoute` et les intercepteurs API.
  - [x] Concevoir la page de Login premium et le Dashboard Directeur reliés en temps réel à l'API.
- [x] **Tâche 8 : Écrans complémentaires, CRM & Navigation**
  - [x] Composants communs réutilisables (KPICard, DataTable, StatusBadge, PageHeader, LoadingSpinner, EmptyState, DashboardRedirect).
  - [x] Layout principal réutilisable (sidebar desktop filtrée par RBAC, topbar avec menu utilisateur, bottom navigation mobile).
  - [x] Tableaux de bord métiers connectés en temps réel (CommercialDashboard, ProjectManagerDashboard, FinanceDashboard, DirectorDashboard refondu).
  - [x] Module CRM & Fiche 360° (AccountList paginée, AccountDetail avec identifiants fiscaux ICE/RC/Patente/IF et onglets interactifs).
  - [x] Routage centralisé et protection stricte par rôles RBAC (App.jsx).
  - [x] Build et validation de production réussis sans aucune erreur.

---

## 🎯 NOW : Saisie mobile-first terrain avancée & PV de réception
- [x] **Tâche 9 : Documents de gestion & Modules métiers** (Création/Visualisation Devis, Suivi Projet, Factures, Règlements)
- [x] **Tâche 10B : Export PDF Professionnel** (Génération PDF Devis/Factures avec Dompdf)
- [x] **Tâche 10A : Validation automatisée via Cypress** (14/14 tests passés avec succès)
- [x] **Tâche 10C : Saisie mobile-first des heures terrain** (Work Logs avancés & Pointage)
- [x] **Tâche 10D : PV de réception de chantier** (avec signature électronique)

---

## 🛡️ LATER : Tests unitaires et Déploiement
- [ ] Élaboration d'une couverture de tests unitaires côté frontend.
- [ ] Automatisation des tests Laravel via PHPUnit.
- [ ] Configuration de pipelines de CI/CD.
- [ ] Déploiement en pré-production (Staging).
