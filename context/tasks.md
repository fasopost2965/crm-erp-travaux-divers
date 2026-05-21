# TASKS.md - Suivi des tâches de l'ERP/CRM BTP

---

## ✅ DONE : Tâches 1 à 6 (Backend & Maquettes)
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

---

## 🎯 NOW : Tâche 7 - Setup frontend React/Vite & Intégration API
- [ ] **Initialisation du projet frontend dans `/code/frontend`**
  - [ ] Installer Vite + React et configurer l'environnement.
  - [ ] Installer Tailwind CSS, PostCSS et Autoprefixer.
  - [ ] Configurer les tokens de design system (couleurs, espacements, typographie).
- [ ] **Configuration de l'infrastructure de communication API**
  - [ ] Installer et configurer Axios (baseUrl, interceptors de requêtes/erreurs).
  - [ ] Mettre en place React Query (`@tanstack/react-query`) pour la gestion du cache et des requêtes.
- [ ] **Authentification & Session**
  - [ ] Créer le contexte d'authentification (`AuthContext`).
  - [ ] Implémenter le stockage sécurisé du token de session.
  - [ ] Créer le composant de routes protégées (`ProtectedRoute`).

---

## 🚀 NEXT : Implémentation des écrans prioritaires
- [ ] Écran de connexion (Login Screen)
- [ ] Layout principal (Sidebar Desktop, Bottom Bar Mobile)
- [ ] Dashboard Directeur (Executive Dashboard - Desktop + Mobile)
- [ ] Dashboard Commercial (Commercial Dashboard - Desktop)
- [ ] Liste des Clients & Fiche Client détaillée
- [ ] Autres Tableaux de bord (Chef Chantier, Finance)
- [ ] Documents de gestion (Création/Visualisation Devis, Suivi Projet, Factures)
- [ ] Saisie mobile-first des heures terrain (Work Logs)

---

## 🛡️ LATER : Tests et Déploiement
- [ ] Élaboration d'une couverture de tests unitaires et d'intégration côté frontend.
- [ ] Automatisation des tests Laravel via PHPUnit.
- [ ] Configuration de pipelines de CI/CD (GitHub Actions / GitLab CI).
- [ ] Déploiement en environnement de pré-production (Staging).
