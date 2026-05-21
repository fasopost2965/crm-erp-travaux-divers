# TASKS.md - Suivi des tâches (Phases d'implémentation)

---

## 🚀 Phase 1 : CRM de base, Rôles et Authentification
- [ ] Créer les migrations 1 à 8 (roles, users, permissions, role_permissions, accounts, contacts, leads, opportunities)
- [ ] Créer les modèles associés (User, Role, Permission, Account, Contact, Lead, Opportunity, Activity, Note, Document) avec SoftDeletes et relations camelCase
- [ ] Mettre en place le Seeder complet pour rôles et utilisateurs
- [ ] Configurer l'authentification (Sanctum)

---

## 💼 Phase 2 : Ventes et Devis (Quotes)
- [ ] Créer les migrations 9 à 15 (quote_templates, quotes, quote_items, invoice_templates, invoices, invoice_items, payments)
- [ ] Créer les modèles associés (QuoteTemplate, Quote, QuoteItem, InvoiceTemplate, Invoice, InvoiceItem, Payment)
- [ ] Créer le ResourceController `QuoteController`
- [ ] Implémenter les calculs automatiques financiers

---

## 🚧 Phase 3 : Projets et Chantiers
- [ ] Créer les migrations 16 à 23 (project_templates, projects, project_tasks, project_team_members, work_logs, project_photos, project_documents, project_signatures)
- [ ] Créer les modèles associés (ProjectTemplate, Project, ProjectTask, ProjectTeamMember, WorkLog, ProjectPhoto, ProjectDocument, ProjectSignature)
- [ ] Créer le ResourceController `ProjectController`
- [ ] Gérer les feuilles de temps (WorkLogs)

---

## 🔒 Phase 4 : Sécurité, Services Métier et API
- [ ] Créer les Policies Laravel pour chaque entité principale
- [ ] Créer les Services métiers
- [ ] Déclarer toutes les routes API RESTful propres dans `routes/api.php`
- [ ] Exécuter `php artisan migrate:fresh --seed` et vérifier
