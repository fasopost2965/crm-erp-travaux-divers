# STATE.md - État d'avancement du projet

Dernière mise à jour : 2026-05-24 — Session BatiPro integration complète
Version du projet : v0.7.0 (Refonte design BatiPro + 4 nouveaux modules ✅)

---

## 1. Résumé de l'état actuel

- **Backend MVP** : COMPLET ✅ (Laravel 11.x, Auth Sanctum, 30 migrations, 26 modèles, API CRUD, RBAC, dashboards par rôle, PDF Dompdf, PV de réception)
- **Maquettes Stitch** : COMPLÈTES ✅ (13 écrans interactifs)
- **Frontend & CRM** : COMPLET ✅ (Vite + React, Tailwind CSS v4, AuthContext, RBAC, tous les écrans métiers)
- **Exports PDF (Tâche 10B)** : COMPLET ✅ (Devis, Factures, PV de réception)
- **Tests Cypress E2E (Tâche 10A)** : COMPLET ✅ (14/14 tests)
- **Work Logs mobile-first (Tâche 10C)** : COMPLET ✅ (GPS, modes dual, quick-hours, statuts, liste dédiée)
- **PV de réception (Tâche 10D)** : COMPLET ✅ (canvas signatures réel, double signataire, PDF officiel)
- **Modules CRM complets** : COMPLET ✅ (ContactList/Form, LeadList/Form, OpportunityList/Form, AccountForm — 7 pages + 12 routes)
- **Refonte design BatiPro** : COMPLET ✅ (sidebar noire #1C1C1C, couleur primaire terracotta #C85A2A, login BatiPro, KPI cards border-top)
- **Nouveaux modules BTP** : COMPLET ✅ (Trésorerie, Situations de travaux, Pointage journalier, Paramètres)
- **Prochaine étape** : Tests PHPUnit backend et/ou CI/CD pipeline + backend pour nouveaux modules

---

## 2. Statut des Modules

| Module | Statut | Description |
|---|---|---|
| **Gouvernance & Docs** | 🟢 Complété | Tous les fichiers context/ à jour |
| **Laravel Boilerplate** | 🟢 Complété | Laravel 11.x, .env configuré |
| **Base de Données & Migrations** | 🟢 Complété | 30 migrations exécutées |
| **Modèles Eloquent** | 🟢 Complété | 26 modèles, relations camelCase, SoftDeletes |
| **Contrôleurs CRUD & API Resources** | 🟢 Complété | 7 contrôleurs RESTful + sous-ressources projet |
| **Authentification & RBAC** | 🟢 Complété | Sanctum, CheckRole middleware, 7 Policies |
| **Suivi de Chantier & Opérations Terrain** | 🟢 Complété | 5 contrôleurs imbriqués, Work Logs avancés |
| **Pilotage & Dashboards par Rôle** | 🟢 Complété | 4 dashboards API (directeur, commercial, chef, finance) |
| **Maquettes Interactives UI** | 🟢 Complété | 13 maquettes Stitch générées |
| **Frontend React/Vite** | 🟢 Complété | Vite + React, Tailwind CSS v4, AuthContext, RBAC |
| **Navigation & Layout Global** | 🟢 Complété | Sidebar noire BatiPro, sections nav, Bottom nav mobile |
| **Écrans complémentaires & CRM** | 🟢 Complété | Dashboards métiers, CRM 360°, AccountList/Detail |
| **Devis, Projets, Factures & Paiements** | 🟢 Complété | Tous les écrans CRUD avec onglets 360° |
| **Exports PDF Professionnels (10B)** | 🟢 Complété | Devis, Factures (Dompdf + templates Blade) |
| **Tests Cypress E2E (10A)** | 🟢 Complété | 14/14 tests — Auth, RBAC, CRM, Projets, Finance |
| **Work Logs Mobile-first (10C)** | 🟢 Complété | GPS auto, quick-hours 1/2/4/8/10h, mode entrée/sortie |
| **PV de Réception (10D)** | 🟢 Complété | SignaturePad canvas, double signature, PDF officiel |
| **Modules CRM Manquants** | 🟢 Complété | ContactList/Form, LeadList/Form, OpportunityList/Form |
| **Dashboards Redesign Pro** | 🟢 Complété | 4 dashboards refondus — ring charts CSS, tunnel conversion |
| **Utilisateurs Demo Complets** | 🟢 Complété | finance@travaux.ma + directeur@travaux.ma ajoutés |
| **Refonte Design BatiPro** | 🟢 Complété | Sidebar #1C1C1C, terracotta #C85A2A, Login BatiPro, KPI cards |
| **Module Trésorerie** | 🟢 Complété | Flux par chantier, KPIs, transactions + mock décaissements |
| **Module Situations de travaux** | 🟢 Complété | Avancement % → calcul HT/TVA/retenue, détail postes |
| **Module Pointage journalier** | 🟢 Complété | CDI/CDD/journaliers, toggle présence, HS, masse salariale |
| **Module Paramètres** | 🟢 Complété | Société (ICE/IF/RC), Utilisateurs, Barèmes CNSS, Facturation |

---

## 3. Architecture technique actuelle

### Backend
- **Framework** : Laravel 11.x (PHP 8.2+)
- **Auth** : Sanctum token-based + RBAC middleware `CheckRole`
- **PDF** : `barryvdh/laravel-dompdf` — Devis, Factures, PV de réception
- **DB** : SQLite (local), MySQL/PostgreSQL (prod), 30 migrations séquentielles
- **Routes** : `/api/projects/{id}/pv-pdf` (nouveau), toutes les sous-ressources imbriquées

### Frontend
- **Stack** : Vite + React 18, Tailwind CSS v4, React Query, Axios, React Router DOM
- **Design system** : BatiPro-inspired — sidebar `#1C1C1C`, primaire `#C85A2A` terracotta, fond `#F4F4F5`
- **KPI cards** : `border-top: 2px solid [color]`, border-radius 10px — style BatiPro
- **Composants** : DataTable, KPICard, StatusBadge, SignaturePad, PageHeader, ConfirmDialog, etc.
- **Nouveaux modules** : Tresorerie, Situations, PointageJournalier, Parametres (4 pages)
- **Total pages** : 31 pages React

---

## 4. Ressources BatiPro intégrées

Dossier `ressources +/` contient :
- `BatiPro_Cahier_des_charges.md` — spec ERP complet BTP Maroc
- `Brainstorming.md` — vision design & modules
- 9 fichiers HTML — maquettes interactives (dashboard, chantiers, RH/paie, trésorerie, documents PDF, paramètres, etc.)

Ces ressources ont guidé :
1. Refonte couleur primaire → terracotta `#C85A2A`
2. Sidebar noire `#1C1C1C`
3. Style KPI cards (border-top accent)
4. Modules manquants identifiés et créés

---

## 5. Prochaines Actions

1. **Backend nouveaux modules** : APIs pour Trésorerie (mouvements), Situations (avancement), Pointage (attendance)
2. **PHPUnit** : Tests unitaires Laravel (Models, Controllers, Requests, Policies)
3. **CI/CD** : GitHub Actions — lint, tests, build frontend, deploy staging
4. **Staging** : Déploiement sur serveur de pré-production (VPS ou Railway/Render)
5. **Module Achats & Stock** : Bons de commande fournisseurs, réception matériaux, alertes rupture
6. **RH & Paie** : Fiches employés CNSS/IGR, bulletins de paie, export virement
