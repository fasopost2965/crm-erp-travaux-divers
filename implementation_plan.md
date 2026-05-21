# Plan d'implémentation - Tâche 4 : Noyau Métier Projets / Terrain

Ce plan détaille la mise en œuvre de la couche métier liée au suivi de chantier et aux opérations sur le terrain dans l'application Laravel 11.x (Tâche 4).

## User Review Required

> [!IMPORTANT]
> **Architecture de Routage pour les sous-ressources de Projet**
> Afin de respecter la structure relationnelle `Project hasMany ...`, nous proposons d'exposer les sous-ressources de chantier en tant que routes de ressources imbriquées (Nested Resources) conformes aux standards RESTful de Laravel :
> - `/api/projects/{project}/tasks` (`ProjectTaskController`)
> - `/api/projects/{project}/work-logs` (`WorkLogController`)
> - `/api/projects/{project}/photos` (`ProjectPhotoController`)
> - `/api/projects/{project}/documents` (`ProjectDocumentController`)
> - `/api/projects/{project}/signatures` (`ProjectSignatureController`)
>
> **Règles d'autorisation fines pour le Terrain**
> - **Tâches (`ProjectTask`)** :
>   - *Lecture* : Admin, Directeur, Chef chantier, Technicien.
>   - *Écriture / Modification* : Admin, Directeur, Chef chantier.
>   - *Suppression* : Admin, Chef chantier.
> - **Suivis d'heures (`WorkLog`)** :
>   - *Lecture* : Admin, Directeur, Chef chantier, Finance.
>   - *Déclaration (Écriture)* : Tout technicien ou ouvrier (ne peut déclarer que pour soi-même `user_id == auth()->id()`), admin, directeur, chef de chantier.
> - **Photos du chantier (`ProjectPhoto`)** :
>   - *Lecture* : Tous les rôles connectés.
>   - *Téléversement* : Admin, Directeur, Chef chantier, Technicien.
> - **Documents du chantier (`ProjectDocument`)** :
>   - *Lecture* : Admin, Directeur, Chef chantier, Technicien, Finance.
>   - *Téléversement* : Admin, Directeur, Chef chantier.
> - **Signatures de PV (`ProjectSignature`)** :
>   - *Lecture* : Admin, Directeur, Chef chantier, Finance.
>   - *Création* : Admin, Directeur, Chef chantier. (Pas de modification/suppression autorisée pour préserver la valeur légale du PV).

---

## Open Questions

> [!NOTE]
> 1. **Validation du technicien sur ses propres feuilles d'heures (`WorkLogs`)** :
>    Est-il bien requis que le technicien ne puisse modifier ou supprimer que ses propres déclarations de temps de travail ? (C'est ce que nous prévoyons d'implémenter par défaut).
> 2. **Stockage physique des photos et documents** :
>    Pour le moment, nous allons valider les chemins de fichiers sous forme de chaînes de caractères (URLs ou chemins relatifs) dans les requêtes de test. Est-ce conforme ?

---

## Proposed Changes

Toutes les modifications seront apportées sous `/code/backend`.

### 1. Contrôleurs API RESTful

Nous allons créer 5 contrôleurs de ressources imbriqués sous `app/Http/Controllers/Api/` :

#### [NEW] [ProjectTaskController.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/app/Http/Controllers/Api/ProjectTaskController.php)
- Gère les tâches rattachées au chantier.
- Méthodes implémentées : `index`, `store`, `show`, `update`, `destroy`.

#### [NEW] [WorkLogController.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/app/Http/Controllers/Api/WorkLogController.php)
- Gère les déclarations de temps (heures travaillées).
- Méthodes implémentées : `index`, `store`, `show`, `update`, `destroy`.

#### [NEW] [ProjectPhotoController.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/app/Http/Controllers/Api/ProjectPhotoController.php)
- Gère le téléversement et le suivi des photos d'avancement.
- Méthodes implémentées : `index`, `store`, `show`, `destroy`.

#### [NEW] [ProjectDocumentController.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/app/Http/Controllers/Api/ProjectDocumentController.php)
- Gère les documents associés au projet.
- Méthodes implémentées : `index`, `store`, `show`, `update`, `destroy`.

#### [NEW] [ProjectSignatureController.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/app/Http/Controllers/Api/ProjectSignatureController.php)
- Gère la réception et validation de PV signés.
- Méthodes implémentées : `index`, `store`, `show`.

---

### 2. FormRequests de Validation (`app/Http/Requests`)

Nous allons créer les requêtes de validation strictes :
- **Tâches** : `StoreProjectTaskRequest`, `UpdateProjectTaskRequest` (validation de `title` requis, `status` dans enum, `priority`, dates cohérentes).
- **Temps** : `StoreWorkLogRequest`, `UpdateWorkLogRequest` (validation de `hours_worked` numérique positif, `work_date`).
- **Photos** : `StoreProjectPhotoRequest` (validation de `file_path`, `title`, `stage`).
- **Documents** : `StoreProjectDocumentRequest` (validation de `file_path`, `title`, `type`).
- **Signatures** : `StoreProjectSignatureRequest` (validation de `client_name`, `signature_data`, `signed_at`).

---

### 3. API Resources de Transformation (`app/Http/Resources`)

Nous créerons les API Resources pour s'assurer que toutes les sorties JSON respectent la convention `camelCase` globale :
- **`ProjectTaskResource`**
- **`WorkLogResource`**
- **`ProjectPhotoResource`**
- **`ProjectDocumentResource`**
- **`ProjectSignatureResource`**

---

### 4. Policies d'Autorisation (`app/Policies`)

Nous générerons et configurerons 5 Policies pour contrôler l'accès à ces sous-ressources :
- **`ProjectTaskPolicy.php`**
- **`WorkLogPolicy.php`**
- **`ProjectPhotoPolicy.php`**
- **`ProjectDocumentPolicy.php`**
- **`ProjectSignaturePolicy.php`**

---

### 5. Routage API (`routes/api.php`)

#### [MODIFY] [api.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/routes/api.php)
Nous allons déclarer les routes imbriquées sous le middleware `auth:sanctum` :
```php
Route::apiResource('projects.tasks', ProjectTaskController::class);
Route::apiResource('projects.work-logs', WorkLogController::class);
Route::apiResource('projects.photos', ProjectPhotoController::class)->except(['update']);
Route::apiResource('projects.documents', ProjectDocumentController::class);
Route::apiResource('projects.signatures', ProjectSignatureController::class)->only(['index', 'store', 'show']);
```

---

## Verification Plan

### Automated Tests (In-Memory Integration Script)
Nous créerons un script d'intégration temporaire `test_project_terrain.php` pour simuler le cycle de vie complet des sous-ressources en mémoire :
1. **Test 1** : `GET /api/projects` (récupérer la liste des chantiers en tant que technicien ou PM).
2. **Test 2** : `POST /api/projects/{id}/tasks` (créer une tâche de chantier par le Chef de Chantier).
3. **Test 3** : `POST /api/projects/{id}/work-logs` (déclarer des heures de travail par le Technicien).
4. **Test 4** : Vérification des restrictions de droits (un Technicien essayant de supprimer une tâche doit recevoir un code HTTP `403 Forbidden`).

Après validation des tests en local, le script de test temporaire sera supprimé pour laisser un dépôt propre.
