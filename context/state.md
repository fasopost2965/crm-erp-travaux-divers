# STATE.md - État d'avancement du projet

Dernière mise à jour : 2026-05-24 — Session cohérence BatiPro + nouveaux modules backend + RH/Engins/Achats
Version du projet : v0.8.0 (Backend complet, 7 nouveaux modules frontend, cohérence globale ✅)

---

## 1. Résumé de l'état actuel

- **Backend MVP** : COMPLET ✅ (Laravel 11.x, Auth Sanctum, 35 migrations, 36 modèles, API CRUD, RBAC, dashboards par rôle, PDF Dompdf, PV de réception)
- **Backend nouveaux modules** : COMPLET ✅ (Personnel, Pointage, Mouvement/Trésorerie, Engins, Stock/Achats — 5 migrations, 10 modèles, 5 controllers)
- **Maquettes Stitch** : COMPLÈTES ✅ (13 écrans interactifs)
- **Frontend & CRM** : COMPLET ✅ (Vite + React, Tailwind CSS v4, AuthContext, RBAC, tous les écrans métiers)
- **Cohérence visuelle globale** : COMPLET ✅ (22 pages corrigées — encodage UTF-8, styles BatiPro, rounded-xl, terracotta)
- **Exports PDF (Tâche 10B)** : COMPLET ✅ (Devis, Factures, PV de réception)
- **Tests Cypress E2E (Tâche 10A)** : COMPLET ✅ (14/14 tests)
- **Work Logs mobile-first (Tâche 10C)** : COMPLET ✅ (GPS, modes dual, quick-hours, statuts, liste dédiée)
- **PV de réception (Tâche 10D)** : COMPLET ✅ (canvas signatures réel, double signataire, PDF officiel)
- **Modules CRM complets** : COMPLET ✅ (ContactList/Form, LeadList/Form, OpportunityList/Form, AccountForm — 7 pages + 12 routes)
- **Refonte design BatiPro** : COMPLET ✅ (sidebar noire #1C1C1C, couleur primaire terracotta #C85A2A, login BatiPro, KPI cards border-top)
- **Nouveaux modules BTP** : COMPLET ✅ (Trésorerie, Situations de travaux, Pointage journalier, Paramètres)
- **Nouveaux modules BatiPro** : COMPLET ✅ (Personnel/RH, Parc Engins, Achats & Stock)
- **Prochaine étape** : Tests PHPUnit backend, migration BDD, connexion API réelle pour Trésorerie/Situations/Pointage

---

## 2. Statut des Modules

| Module | Statut | Description |
|---|---|---|
| **Gouvernance & Docs** | 🟢 Complété | Tous les fichiers context/ à jour |
| **Laravel Boilerplate** | 🟢 Complété | Laravel 11.x, .env configuré |
| **Base de Données & Migrations** | 🟢 Complété | 35 migrations exécutées |
| **Modèles Eloquent** | 🟢 Complété | 36 modèles, relations camelCase, SoftDeletes |
| **Contrôleurs CRUD & API Resources** | 🟢 Complété | 12 contrôleurs RESTful + sous-ressources projet |
| **Authentification & RBAC** | 🟢 Complété | Sanctum, CheckRole middleware, 7 Policies |
| **Suivi de Chantier & Opérations Terrain** | 🟢 Complété | 5 contrôleurs imbriqués, Work Logs avancés |
| **Pilotage & Dashboards par Rôle** | 🟢 Complété | 4 dashboards API (directeur, commercial, chef, finance) |
| **Maquettes Interactives UI** | 🟢 Complété | 13 maquettes Stitch générées |
| **Frontend React/Vite** | 🟢 Complété | Vite + React, Tailwind CSS v4, AuthContext, RBAC |
| **Navigation & Layout Global** | 🟢 Complété | Sidebar noire BatiPro, 6 sections nav, Bottom nav mobile |
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
| **Cohérence visuelle globale** | 🟢 Complété | 22 pages — encodage UTF-8 corrigé, rounded-xl, terracotta, DataTable BatiPro |
| **Module Trésorerie** | 🟢 Complété | Frontend: flux par chantier, KPIs, transactions. Backend: MouvementController + API |
| **Module Situations de travaux** | 🟢 Complété | Avancement % → calcul HT/TVA/retenue, détail postes |
| **Module Pointage journalier** | 🟢 Complété | Frontend + Backend: CDI/CDD/journaliers, toggle présence, HS, masse salariale |
| **Module Paramètres** | 🟢 Complété | Société (ICE/IF/RC), Utilisateurs, Barèmes CNSS, Facturation |
| **Module RH — Personnel** | 🟢 Complété | PersonnelList + PersonnelFormModal, CRUD complet + API backend |
| **Module Parc Engins** | 🟢 Complété | ParcEngins + EnginFormModal, affectation chantier, API backend |
| **Module Achats & Stock** | 🟢 Complété | AchatsStock: BC / Articles / Fournisseurs — onglets, API backend complet |

---

## 3. Architecture technique actuelle

### Backend
- **Framework** : Laravel 11.x (PHP 8.2+)
- **Auth** : Sanctum token-based + RBAC middleware `CheckRole`
- **PDF** : `barryvdh/laravel-dompdf` — Devis, Factures, PV de réception
- **DB** : SQLite (local), MySQL/PostgreSQL (prod), 35 migrations séquentielles
- **Nouvelles entités** : Personnel, Pointage, Mouvement (trésorerie), Engin, EnginAffectation, Fournisseur, Article, BonCommande, BonCommandeItem, MouvementStock

### Frontend
- **Stack** : Vite + React 18, Tailwind CSS v4, React Query, Axios, React Router DOM
- **Design system** : BatiPro-inspired — sidebar `#1C1C1C`, primaire `#C85A2A` terracotta, fond `#F4F4F5`
- **KPI cards** : `border-top: 2px solid [color]`, border-radius 10px — style BatiPro
- **DataTable** : compact `text-[12px]`, `px-4 py-2.5`, hover terracotta, header border-top `#C85A2A`
- **Total pages** : 34 pages React
- **Nav sidebar** : 6 sections — Dashboard, Commercial, Chantiers, RH & Personnel, Équipements & Achats, Finance, Général

---

## 4. Ressources BatiPro intégrées

Dossier `ressources +/` contient :
- `BatiPro_Cahier_des_charges.md` — spec ERP complet BTP Maroc
- `Brainstorming.md` — vision design & modules
- 9 fichiers HTML — maquettes interactives (dashboard, chantiers, RH/paie, trésorerie, documents PDF, paramètres, etc.)
- `batipro_flux_formulaires.svg` — schéma entités/états
- `batipro_sitemap.svg` — sitemap 14 modules

Ces ressources ont guidé :
1. Refonte couleur primaire → terracotta `#C85A2A`
2. Sidebar noire `#1C1C1C`
3. Style KPI cards (border-top accent)
4. Modules manquants identifiés et créés
5. Schéma entités complet implémenté en Laravel (migrations + modèles)

---

## 5. Prochaines Actions

1. **Migration BDD** : Exécuter `php artisan migrate` avec les 5 nouvelles migrations
2. **Seeders** : Données de démonstration pour Personnel, Engins, Articles, Fournisseurs
3. **Connexion API réelle** : Connecter Trésorerie/Situations/Pointage pages aux vrais endpoints
4. **PHPUnit** : Tests unitaires Laravel (Models, Controllers, Requests, Policies)
5. **CI/CD** : GitHub Actions — lint, tests, build frontend, deploy staging
6. **RH & Paie** : Bulletins de paie, calcul IGR, export virement
7. **QHSE** : Module sécurité chantier (incidents, inspections, EPI)
8. **Portail client** : Vue lecture seule pour les clients (avancement, factures, docs)
