# Atlas Works — ERP/CRM BTP

> Système de gestion d'entreprise complet pour une PME de travaux au Maroc.  
> Stack : **Laravel 13 / PHP 8.3** (backend API) · **React 19 / Vite 8 / Tailwind CSS v4** (frontend SPA)

---

## 📋 Description

**Atlas Works** est un ERP/CRM métier conçu pour une entreprise de travaux divers et d'aménagement basée au Maroc.  
Il couvre l'ensemble de la chaîne de valeur commerciale et opérationnelle :

- **CRM** : Gestion des clients (ICE, RC, Patente, IF), contacts, leads et opportunités
- **Ventes** : Devis avec lignes dynamiques, statuts et export PDF
- **Chantiers** : Projets, Kanban de tâches, saisie d'heures, galerie photos, PV et signatures
- **Finances** : Facturation de situation, enregistrement de règlements, suivi des restes à recouvrer
- **Pilotage** : Dashboards métiers par rôle (Directeur, Commercial, Chef de Chantier, Finance)
- **Sécurité** : Authentification par token Sanctum + RBAC à 8 niveaux de rôles

---

## 🏗️ Architecture

```
crm-erp-travaux-divers/
├── code/
│   ├── backend/          # API Laravel 13.x (PHP 8.3)
│   └── frontend/         # SPA React 19 + Vite 8
├── context/              # Documentation de suivi de projet
│   ├── AGENTS.md         # Instructions pour les agents IA
│   ├── state.md          # État courant du projet
│   ├── tasks.md          # Liste des tâches et avancement
│   ├── session-log.md    # Journal d'activité par session
│   ├── decisions.md      # Décisions techniques et design
│   └── handoff.md        # Instructions de reprise
└── docs/
    ├── master-brief.md   # Cahier des charges
    └── core-flows.md     # Flux métier principaux
```

---

## 🚀 Démarrage rapide

### Prérequis
- PHP 8.3+ avec extensions : `pdo_mysql`, `gd`, `curl`, `mbstring`, `openssl`
- MySQL 8+ / MariaDB 10.6+
- Node.js 20+ / npm 10+
- Composer 2.x

### Backend (Laravel)

```bash
cd code/backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
# → http://127.0.0.1:8000
```

### Frontend (React/Vite)

```bash
cd code/frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 🔐 Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin / Directeur | `admin@travaux.ma` | `password` |
| Commercial | `commercial@travaux.ma` | `password` |
| Chef de Chantier | `khalid@travaux.ma` | `password` |
| Finance | `finance@travaux.ma` | `password` |

---

## 📡 API REST — Endpoints principaux

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Connexion (retourne un token Sanctum) |
| `GET` | `/api/auth/me` | Profil de l'utilisateur connecté |
| `POST` | `/api/auth/logout` | Déconnexion |
| `GET/POST` | `/api/accounts` | Clients CRM |
| `GET/POST` | `/api/quotes` | Devis |
| `GET` | `/api/quotes/{id}/pdf` | Export PDF du devis |
| `GET/POST` | `/api/invoices` | Factures |
| `GET` | `/api/invoices/{id}/pdf` | Export PDF de la facture |
| `GET/POST` | `/api/projects` | Projets / Chantiers |
| `POST` | `/api/invoices/{id}/payments` | Enregistrer un règlement |
| `GET` | `/api/dashboard/director` | KPIs Directeur (rôle requis) |
| `GET` | `/api/dashboard/commercial` | KPIs Commercial (rôle requis) |
| `GET` | `/api/dashboard/project-manager` | KPIs Chef de Chantier (rôle requis) |
| `GET` | `/api/dashboard/finance` | KPIs Finance (rôle requis) |

---

## ✅ État du projet — v0.4.1

| Composant | Statut |
|---|---|
| Backend API Laravel (28 migrations, 26 modèles, CRUD + RBAC) | ✅ Complet |
| Authentification Sanctum + Middleware RBAC | ✅ Complet |
| Dashboards par rôle (4 endpoints + calculs KPI temps réel) | ✅ Complet |
| Frontend React/Vite — Layout, Auth, Navigation RBAC | ✅ Complet |
| CRM Clients 360° (ICE, RC, Patente, IF + onglets) | ✅ Complet |
| Module Devis (liste, détail, formulaire, lignes dynamiques) | ✅ Complet |
| Module Projets/Chantiers (Kanban, heures, photos, signatures) | ✅ Complet |
| Module Factures & Règlements (situation, rest à recouvrer) | ✅ Complet |
| Export PDF Devis & Factures (Dompdf, mentions légales marocaines) | ✅ Complet |
| Tests E2E Cypress — 14/14 passing (Auth, CRM, Devis, Chantier, Finance, RBAC) | ✅ Complet |
| Build de production Vite — 0 erreur | ✅ Complet |
| Maquettes Stitch (13 écrans Desktop/Mobile) | ✅ Complet |

---

## 🧪 Tests

### Tests E2E Cypress (Frontend)
```bash
cd code/frontend
npx cypress run          # Headless
npx cypress open         # Interface graphique
```

**Résultats** : 14/14 tests passés — Auth · Dashboard · CRM · Devis · Chantier · Finance · RBAC

### Tests unitaires PHP (Backend)
```bash
cd code/backend
php artisan test
```

---

## 🗺️ Roadmap

- **Tâche 10C** : Saisie mobile-first avancée des heures terrain (Work Logs) avec géolocalisation
- **Tâche 10D** : PV de réception de chantier avec signature électronique client en ligne
- **Déploiement** : Configuration CI/CD GitHub Actions + mise en pré-production

---

## 🇲🇦 Conformité marocaine

Les documents générés (Devis, Factures) respectent les obligations légales marocaines :
- **ICE** (Identifiant Commun de l'Entreprise)
- **RC** (Registre du Commerce)
- **IF** (Identifiant Fiscal)
- **Patente** (Taxe Professionnelle)
- **TVA** à 20% sur les prestations de travaux
- **RIB bancaire** pour les virements

---

## 📄 Licence

Projet privé — © 2026 Atlas Works S.A.R.L. AU — Tous droits réservés.
