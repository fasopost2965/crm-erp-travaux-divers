# TASKS.md - Suivi des tâches de l'ERP/CRM BTP

---

## ✅ DONE : Tâches 1 à 10D (MVP Complet)

- [x] **Tâche 1 : Base de Données, Migrations & Seeders**
  - [x] Laravel 11.x + configuration PostgreSQL/MySQL
  - [x] 28 migrations séquentielles validées sans erreur de clé étrangère
  - [x] Seeder : 8 rôles (`super_admin`, `admin`, `directeur`, `commercial`, `chef_chantier`, `technicien`, `finance`, `rh`)

- [x] **Tâche 2 : Modèles Eloquent & Relations CRM/Ventes/Projets**
  - [x] 26 modèles configurés avec relations `camelCase` et SoftDeletes

- [x] **Tâche 3 : API CRUD & Resource Controllers**
  - [x] 7 contrôleurs RESTful avec FormRequests et sérialisation `camelCase`

- [x] **Tâche 4 : Authentification Sanctum & RBAC**
  - [x] Sanctum, middleware `CheckRole`, 7 Policies

- [x] **Tâche 5 : Opérations Terrain & Pilotage par Rôle**
  - [x] 5 contrôleurs de sous-ressources de chantier imbriquées
  - [x] Endpoints `/api/dashboard/*` (directeur, commercial, chef de chantier, finance)

- [x] **Tâche 6 : Conception & Génération des Maquettes Stitch**
  - [x] Charte graphique unifiée (Inter, bleu #1D4ED8, fond #F8FAFC)
  - [x] 13 maquettes interactives Desktop/Mobile

- [x] **Tâche 7 : Setup Frontend React/Vite & Intégration API**
  - [x] Vite + React, Tailwind CSS v4, Axios, React Query, React Router
  - [x] AuthContext, ProtectedRoute, Login premium, Dashboard Directeur

- [x] **Tâche 8 : Écrans complémentaires, CRM & Navigation**
  - [x] Composants communs réutilisables (KPICard, DataTable, StatusBadge, PageHeader…)
  - [x] Layout principal (sidebar RBAC, topbar, bottom nav mobile)
  - [x] 4 Dashboards métiers connectés en temps réel
  - [x] Module CRM : AccountList paginée, AccountDetail 360° (ICE/RC/Patente/IF)

- [x] **Tâche 9 : Documents de gestion & Modules métiers**
  - [x] QuoteList/Detail/Form avec lignes dynamiques
  - [x] ProjectList/Detail/Form avec onglets 360° (Kanban, Heures, Photos, Docs, Signatures)
  - [x] InvoiceList/Detail/Form avec Situation d'avancement
  - [x] PaymentForm — enregistrement des règlements financiers

- [x] **Tâche 10A : Validation automatisée via Cypress**
  - [x] 6 specs, 14/14 tests E2E passés (Auth, Dashboard, CRM, Chantier, Finance, RBAC)

- [x] **Tâche 10B : Export PDF Professionnel**
  - [x] Dompdf intégré, templates Blade Devis + Factures (ICE, RC, RIB, TVA 20%)
  - [x] Téléchargement direct depuis les fiches de détail frontend

- [x] **Tâche 10C : Saisie mobile-first des heures terrain**
  - [x] Migration : `start_time`, `end_time`, `location_lat`, `location_lng`, `status` sur `work_logs`
  - [x] `WorkLogForm` réécrit : mode durée directe (boutons rapides 1h/2h/4h/8h/10h) + mode horodatage (entrée/sortie + calcul auto), GPS via `navigator.geolocation`, radio statut (Brouillon/Soumis)
  - [x] `WorkLogList` : page dédiée `/projects/:id/work-logs`, filtre par date, badges statut colorés, total heures
  - [x] `ProjectDetail` onglet Heures : liens vers WorkLogList et WorkLogForm

- [x] **Tâche 10D : PV de réception de chantier avec signature électronique**
  - [x] Migration : `signatory_role`, `notes` sur `project_signatures`
  - [x] `SignaturePad` : canvas tactile réel (mouse + touch events), `useImperativeHandle` (getDataURL, isEmpty, clear)
  - [x] `ReceptionPV` : récap projet (KPIs + grille), tableau tâches terminées, 2 pads signature (client + chef), enregistrement API, téléchargement PDF blob
  - [x] `ProjectController::exportPV()` + route `GET /api/projects/{id}/pv-pdf`
  - [x] Template `pv-reception.blade.php` : PV professionnel (en-tête BATIPLUS, stats, tâches, déclaration formelle DOC marocain, signatures canvas intégrées, pied de page légal)
  - [x] `ProjectDetail` onglet Signatures : lien vers la page PV dédiée

---

## ⏳ LATER : Tests & Déploiement

- [ ] **PHPUnit** : Couverture de tests unitaires backend (Models, Controllers, Policies)
- [ ] **Cypress étendu** : Nouvelles specs pour les écrans 10C/10D (WorkLogList, ReceptionPV, SignaturePad)
- [ ] **CI/CD** : Pipeline GitHub Actions (lint + tests + build Vite)
- [ ] **Déploiement Staging** : Hébergement pré-production (VPS ou PaaS)
- [ ] **`php artisan migrate`** : Appliquer les 2 nouvelles migrations en production
