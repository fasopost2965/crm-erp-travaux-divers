# Configuration Antigravity

## Architecture Laravel

### Models prioritaires à créer

#### CRM
- User (avec rôle)
- Role
- Permission
- Account
- Contact
- Lead
- Opportunity
- Activity
- Note
- Document

#### Ventes
- QuoteTemplate
- Quote
- QuoteItem
- InvoiceTemplate
- Invoice
- InvoiceItem
- Payment

#### Projets
- ProjectTemplate
- Project
- ProjectTask
- ProjectTeamMember
- WorkLog
- ProjectPhoto
- ProjectDocument
- ProjectSignature

### Relations clés

```php
// Account
hasMany: contacts, leads, opportunities, quotes, invoices, projects
belongsTo: owner (User)

// Quote
belongsTo: account, opportunity
hasMany: quoteItems
hasOne: project

// Project
belongsTo: account, quote
hasMany: tasks, teamMembers, workLogs, photos, documents, signatures

// User
belongsTo: role
hasMany: ownedAccounts, leads, opportunities
```

### Migrations ordre de création

1. roles
2. users
3. permissions
4. role_permissions
5. accounts
6. contacts
7. leads
8. opportunities
9. quote_templates
10. quotes
11. quote_items
12. invoice_templates
13. invoices
14. invoice_items
15. payments
16. project_templates
17. projects
18. project_tasks
19. project_team_members
20. work_logs
21. project_photos
22. project_documents
23. project_signatures

### Conventions

- Soft deletes sur toutes les entités principales
- Timestamps partout
- UUID ou auto-increment selon préférence
- Relations nommées proprement en camelCase
- Controllers en ResourceController
- Policies pour chaque modèle principal

### Priorité d'implémentation

Phase 1 :
- Models + migrations CRM de base
- Seeders rôles
- Auth

Phase 2 :
- Models + migrations ventes
- Controllers CRUD quotes

Phase 3 :
- Models + migrations projets
- Controllers CRUD projects

Phase 4 :
- Policies
- Services métier
- API routes
