# Instructions de reprise — CRM/ERP Travaux Divers

## État au 2026-05-23 — MVP COMPLET v0.5.0

### ✅ TOUT EST COMPLET (Tâches 1 → 10D)
- Backend Laravel 11.x API (30 migrations, 26 modèles, RBAC, Sanctum)
- Frontend React/Vite (20+ pages, Tailwind v4, RBAC strict)
- 4 Dashboards métiers temps réel (Directeur, Commercial, Chef Chantier, Finance)
- CRM 360° (clients, contacts, leads, opportunités)
- Devis, Projets (Kanban), Factures, Règlements
- Exports PDF professionnels (Devis, Factures, PV Réception)
- Work Logs mobile-first (GPS, horodatage, statuts)
- PV de réception avec signature canvas réelle
- Tests Cypress E2E 14/14 ✅

---

## 🔧 Action immédiate requise en production

```bash
cd code/backend
php artisan migrate
# Applique les 2 nouvelles migrations :
# - 2026_05_23_000001_add_fields_to_work_logs_table
# - 2026_05_23_000002_add_fields_to_project_signatures_table
```

---

## 🗂️ Structure des fichiers clés

### Backend (`/code/backend`)
```
app/
  Http/
    Controllers/Api/   → ProjectController (+ exportPV), WorkLogController, ProjectSignatureController...
    Requests/          → StoreWorkLogRequest, StoreProjectSignatureRequest (mis à jour)
    Resources/         → WorkLogResource, ProjectSignatureResource (mis à jour)
  Models/              → WorkLog, ProjectSignature (mis à jour)
database/migrations/   → 30 migrations séquentielles
resources/views/pdf/   → quote.blade.php, invoice.blade.php, pv-reception.blade.php
routes/api.php         → Toutes les routes (+ GET projects/{id}/pv-pdf)
```

### Frontend (`/code/frontend/src`)
```
pages/
  WorkLogForm.jsx      → Saisie mobile-first (durée/horodatage/GPS/statut)
  WorkLogList.jsx      → Liste filtrée avec badges statut
  ReceptionPV.jsx      → PV réception complet avec PDF
  ProjectDetail.jsx    → Onglets chantier (Kanban, Heures, Photos, Docs, Signatures PV)
  [+ 15 autres pages]
components/common/
  SignaturePad.jsx     → Canvas tactile réutilisable
  [+ 10 autres composants]
App.jsx                → Toutes les routes protégées par RBAC
```

---

## 🚀 Lancer le projet localement

```bash
# Backend
cd code/backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve   # → http://localhost:8000

# Frontend
cd code/frontend
npm install
npm run dev         # → http://localhost:5173
```

**Comptes de test** (après seed) :
- Directeur : `directeur@batiplus.ma` / `password`
- Commercial : `commercial@batiplus.ma` / `password`
- Chef chantier : `chef@batiplus.ma` / `password`
- Finance : `finance@batiplus.ma` / `password`

---

## ⏭️ Prochaines tâches (LATER)

1. **PHPUnit** : Tests unitaires backend (Models, Policies, Controllers)
2. **Cypress étendu** : Specs pour WorkLogList, ReceptionPV, SignaturePad
3. **CI/CD** : GitHub Actions (lint + tests + build)
4. **Déploiement Staging** : VPS ou PaaS marocain
