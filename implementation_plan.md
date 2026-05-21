# Plan d'implémentation - Tâche 3 : Authentification et Permissions (RBAC)

Ce plan décrit l'implémentation de la couche de sécurité et de contrôle d'accès basée sur les rôles (RBAC) pour le backend Laravel 11.x, à l'aide de Laravel Sanctum, de middlewares personnalisés, et de Policies.

## User Review Required

> [!IMPORTANT]
> **Règles de permissions par rôle**
> - **Super Administrateur (`super_admin`)** : Accès global absolu sur toutes les ressources.
> - **Administrateur (`admin`)** : Accès total sur toutes les ressources de son entreprise.
> - **Directeur (`directeur`)** : Accès complet en lecture, accès en écriture limité (pas de suppression destructive).
> - **Commercial (`commercial`)** : Accès total sur le CRM (`Account`, `Contact`, `Lead`, `Opportunity`) et les ventes (`Quote`, `Invoice`).
> - **Chef de Chantier (`chef_chantier`)** : Accès total sur les chantiers/projets (`Project`, `ProjectTask`).
> - **Technicien (`technicien`)** : Accès en lecture sur les projets/chantiers affectés, écriture de feuilles de temps (`WorkLog`).
> - **Responsable Financier (`finance`)** : Accès total sur la facturation (`Invoice`) et les règlements (`Payment`), lecture seule sur les devis.
> - **Ressources Humaines (`rh`)** : Accès total sur les utilisateurs (`User`) de l'entreprise.

---

## Proposed Changes

Toutes les modifications seront apportées sous `/code/backend`.

### 1. Installation & Configuration de Laravel Sanctum

Nous allons installer Sanctum pour gérer l'authentification par jeton :
- Exécuter `C:\wamp64\bin\php\php8.3.14\php.exe artisan install:api` pour configurer Sanctum, les jetons et le middleware d'API.
- Ajouter le trait `HasApiTokens` dans le modèle `User` (`app/Models/User.php`).

---

### 2. Routes d'Authentification

#### [NEW] [AuthController.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/app/Http/Controllers/Api/AuthController.php)
Ce contrôleur gérera :
- `POST /api/auth/login` : Validation des identifiants, génération du token avec `createToken('auth_token')->plainTextToken`.
- `POST /api/auth/logout` : Révocation du token actif via `$request->user()->currentAccessToken()->delete()`.
- `GET /api/auth/me` : Renvoie les détails de l'utilisateur connecté via un `UserResource` structuré.

#### [NEW] [UserResource.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/app/Http/Resources/UserResource.php)
- Transformation de l'utilisateur pour le format externe camelCase, incluant son rôle et ses permissions associées.

#### [MODIFY] [api.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/routes/api.php)
- Déclaration des routes publiques (`/auth/login`).
- Sécurisation des autres routes d'authentification (`/auth/logout`, `/auth/me`) et des 7 ressources sous le groupe de middleware `auth:sanctum`.

---

### 3. Middleware de Rôles

#### [NEW] [CheckRole.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/app/Http/Middleware/CheckRole.php)
- Un middleware pour intercepter et valider que l'utilisateur connecté possède un rôle valide avant d'autoriser la route. Les utilisateurs avec le rôle `super_admin` contournent les vérifications.

#### [MODIFY] [app.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/bootstrap/app.php)
- Enregistrement de l'alias `'role' => \App\Http\Middleware\CheckRole::class` dans le pipeline de middleware de Laravel 11.x.

---

### 4. Policies d'Autorisation (`app/Policies`)

Nous créerons 7 Policies pour contrôler finement l'accès aux ressources :

1. **`AccountPolicy.php`** : `super_admin` et `admin` (total), `directeur` (lecture + écriture), `commercial` (total), autres (lecture).
2. **`ContactPolicy.php`** : `super_admin`, `admin`, `directeur` (écriture limitée), `commercial` (total), autres (lecture).
3. **`LeadPolicy.php`** : `super_admin`, `admin`, `directeur` (lecture + écriture), `commercial` (total), autres (aucun accès).
4. **`OpportunityPolicy.php`** : `super_admin`, `admin`, `directeur` (lecture + écriture), `commercial` (total), autres (aucun accès).
5. **`QuotePolicy.php`** : `super_admin`, `admin`, `directeur`, `commercial` (total), `finance` (lecture), autres (aucun accès).
6. **`InvoicePolicy.php`** : `super_admin`, `admin`, `directeur`, `finance`, `commercial` (total), autres (aucun accès).
7. **`ProjectPolicy.php`** : `super_admin`, `admin`, `directeur`, `chef_chantier` (total), `technicien` (lecture seule), autres (aucun accès).

---

### 5. Application des Policies dans les Contrôleurs

Chacun des 7 Resource Controllers (`AccountController`, `ContactController`, etc.) utilisera la méthode `$this->authorizeResource(...)` dans son constructeur ou appliquera les vérifications de policy au début de chaque méthode d'action à l'aide de `Gate` ou `$this->authorize()`.

---

## Verification Plan

### Automated Tests (In-Memory Integration Scripts)
- Création d'un script de test temporaire `test_auth_permissions.php` pour simuler des requêtes HTTP avec différents jetons d'utilisateurs (`commercial`, `chef_chantier`, `finance`) :
  1. Vérifier qu'un commercial peut lire et créer un compte, mais ne peut pas voir un projet (`403 Forbidden`).
  2. Vérifier qu'un chef de chantier peut voir un projet, mais ne peut pas créer de facture (`403 Forbidden`).
  3. Vérifier que la déconnexion révoque correctement le token personnel.
- Exécution et validation des codes de statut HTTP attendus.
