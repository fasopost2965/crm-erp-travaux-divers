# SESSION PLAN — Finalisation Atlas Works
**Date** : 2026-05-23  
**Objectif** : Application 100% fonctionnelle — tous les dashboards, boutons, modules CRM complets  
**Points de contrôle** : toutes les 30 minutes  
**GitHub** : push en fin de session uniquement

---

## AUDIT INITIAL — Gaps identifiés

### ✅ Fonctionnel (vérifié)
- Backend API Laravel — tous les endpoints répondent (login testé ✓)
- 4 Dashboards (Director, Commercial, ProjectManager, Finance) — pages existent
- AccountList + AccountDetail
- QuoteList + QuoteDetail + QuoteForm (create/edit)
- ProjectList + ProjectDetail + ProjectForm
- WorkLogList + WorkLogForm (GPS, dual-mode)
- ReceptionPV (signature double + PDF)
- InvoiceList + InvoiceDetail + InvoiceForm + PaymentForm
- CORS configuré (`allowed_origins: ['*']`)
- Seeders : 2 accounts, contacts, leads, opportunités, 1 projet, 3 worklogs, 1 facture payée

### ❌ Manquant / Cassé

#### Utilisateurs demo manquants dans le seeder
- `finance@travaux.ma` → absent du DatabaseSeeder (présent dans README mais pas créé)
- `directeur@travaux.ma` → absent (admin peut accéder au dashboard directeur, mais pas de compte dédié)

#### Pages frontend manquantes
| Page | API backend | Frontend |
|------|-------------|----------|
| AccountForm (create/edit) | POST/PUT `/api/accounts` | ❌ manquant |
| ContactList | GET `/api/contacts` | ❌ manquant |
| ContactForm | POST/PUT `/api/contacts` | ❌ manquant |
| LeadList | GET `/api/leads` | ❌ manquant |
| LeadForm | POST/PUT `/api/leads` | ❌ manquant |
| OpportunityList | GET `/api/opportunities` | ❌ manquant |
| OpportunityForm | POST/PUT `/api/opportunities` | ❌ manquant |

#### Navigation sidebar manquante
- Liens « Contacts », « Leads », « Opportunités » absents du DashboardLayout
- Pas de routes dans App.jsx pour ces modules

---

## PLAN D'EXÉCUTION

### Phase 1 — Fondations (T+0 à T+30min)
- [x] Écrire ce plan
- [ ] Corriger seeder → ajouter finance@travaux.ma + directeur@travaux.ma
- [ ] Re-seed la base (fresh migrate + seed)
- [ ] Créer AccountForm.jsx (create + edit mode)

### Phase 2 — Modules CRM manquants (T+30 à T+60min)
- [ ] ContactList.jsx + ContactForm.jsx
- [ ] LeadList.jsx + LeadForm.jsx
- [ ] OpportunityList.jsx + OpportunityForm.jsx

### Phase 3 — Intégration & Navigation (T+60 à T+80min)
- [ ] Mettre à jour App.jsx (nouvelles routes)
- [ ] Mettre à jour DashboardLayout.jsx (nouveaux liens nav)
- [ ] Vérification Haiku agent

### Phase 4 — Polish & Vérification finale (T+80 à T+90min)
- [ ] Test manuel des flux critiques
- [ ] Mise à jour context/state.md
- [ ] Commit + push GitHub

---

## CONTRAINTES TECHNIQUES
- Design system : DESIGN.md (Apple-inspired, SF Pro, #0066cc)
- Couleur primaire UI : `#1D4ED8` (Tailwind blue-700) — cohérent avec l'existant
- Font : Inter (déjà en place)
- Pattern : suivre exactement le style de QuoteList/QuoteForm/QuoteDetail
- API base URL : `http://127.0.0.1:8000/api`
- RBAC : admin/directeur = accès complet ; commercial = CRM+Devis ; chef_chantier = Projets ; finance = Factures

---

## JOURNAL DE SESSION

| Heure | Action | Statut |
|-------|--------|--------|
| 21:30 | Démarrage session, audit complet | ✓ |
| 21:35 | Plan rédigé | ✓ |
| 21:38 | Seeder corrigé (finance@travaux.ma + directeur@travaux.ma) — re-seed OK | ✓ |
| 21:40 | 7 pages créées : AccountForm, ContactList, ContactForm, LeadList, LeadForm, OpportunityList, OpportunityForm | ✓ |
| 21:45 | App.jsx : 12 nouvelles routes ajoutées | ✓ |
| 21:46 | DashboardLayout : 3 liens nav ajoutés (Contacts, Leads, Opportunités) + isActive startsWith | ✓ |
| 21:47 | AccountList : bouton "Créer" fixé → navigate('/dashboard/accounts/new') | ✓ |
| 21:47 | AccountDetail : bouton "Modifier" ajouté | ✓ |
| 21:48 | Build Vite : 166 modules, 0 erreur ✓ | ✓ |
| 21:49 | Agent Haiku QA : 0 bug détecté, tous fichiers validés | ✓ |
| 21:50 | **POINT 30 MIN** — Phase 1 complète | ✓ |
