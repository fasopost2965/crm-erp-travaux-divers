# Walkthrough - Tâche 3 : Authentification et Permissions par Rôle (RBAC)

Nous avons complété avec succès l'implémentation de la Tâche 3 en intégrant une authentification par jeton sécurisée et un contrôle d'accès basé sur les rôles (RBAC) à travers toute l'API Laravel 11.x.

---

## Changements Réalisés

### 1. Intégration de Laravel Sanctum
- **Installation et Configuration** : Installé le paquet officiel `laravel/sanctum` et publié les fichiers de configuration sous [config/sanctum.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/config/sanctum.php).
- **Migration** : Exécuté la migration pour la table de jetons personnels d'accès sans aucun conflit.
- **Modèle User** : Ajout du trait `Laravel\Sanctum\HasApiTokens` au modèle [User.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/app/Models/User.php).

### 2. Endpoints d'Authentification REST
Nous avons configuré des routes publiques et privées sous [routes/api.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/routes/api.php) :
- `POST /api/auth/login` : Authentification de l'utilisateur par e-mail et mot de passe, renvoie un jeton d'accès en convention camelCase et les détails de l'utilisateur.
- `POST /api/auth/logout` (Protégé) : Révoque le jeton d'accès actif de l'utilisateur connecté.
- `GET /api/auth/me` (Protégé) : Retourne le profil de l'utilisateur connecté formaté via `UserResource`.

### 3. Contrôle d'Accès par Rôles (RBAC)
- **Middleware `CheckRole`** : Création d'un middleware robuste [CheckRole.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/app/Http/Middleware/CheckRole.php) qui intercepte les requêtes et compare le rôle de l'utilisateur à une liste de rôles autorisés (par exemple `'admin'`, `'commercial'`, `'chef_chantier'`). Enregistré sous l'alias `'role'` dans [bootstrap/app.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/bootstrap/app.php).
- **Policies Laravel** : Généré et configuré 7 classes de politiques d'autorisation distinctes pour chaque ressource majeure :
  - `AccountPolicy`
  - `ContactPolicy`
  - `LeadPolicy`
  - `OpportunityPolicy`
  - `QuotePolicy`
  - `InvoicePolicy`
  - `ProjectPolicy`
- **Règles d'accès fines** :
  - **Super Admin** : Accès universel via la méthode de contournement `before()`.
  - **Commercial** : Accès complet aux ressources CRM (Comptes, Contacts, Opportunités, Leads, Devis).
  - **Chef de chantier** : Accès complet aux projets et aux tâches associées.
  - **Finance** : Accès complet aux factures et paiements.

### 4. Compatibilité Laravel 11.x pour `$this->authorizeResource`
- Le contrôleur parent [Controller.php](file:///C:/Users/User/.gemini/antigravity-ide/scratch/crm-erp-travaux-divers/code/backend/app/Http/Controllers/Controller.php) a été configuré pour hériter de `Illuminate\Routing\Controller` au lieu de n'être qu'une classe PHP standard.
- Cela permet l'utilisation fluide et native de `$this->authorizeResource(Model::class, 'parameter')` dans les constructeurs de tous les resource controllers d'API.

---

## Vérification et Validation

### Résultat du Test d'Intégration en Mémoire
Nous avons exécuté et validé l'intégralité du cycle de vie de routage et d'autorisation grâce à un script d'intégration en mémoire simulant l'authentification et les requêtes HTTP avec des jetons de test.

Tous les tests d'accès se sont soldés par une réussite parfaite conforme aux attentes :

```text
=== DEMARRAGE DU TEST D'INTEGRATION DES PERMISSIONS (RBAC) ===

Utilisateurs chargés :
- Admin : Anass El Amrani (Role: admin)
- Commercial : Youssef Benjelloun (Role: commercial)
- PM / Chef Chantier : Khalid Alami (Role: chef_chantier)

Test 1 (Accès non authentifié) : Statut = 401 (Attendu: 401)
Test 2 (Commercial accède au CRM) : Statut = 200 (Attendu: 200)
Test 3 (Commercial accède aux projets) : Statut = 403 (Attendu: 403)
Test 4 (Chef de Chantier accède aux projets) : Statut = 200 (Attendu: 200)
Test 5 (Chef de Chantier accède aux leads) : Statut = 403 (Attendu: 403)
Test 6 (Admin accède aux projets) : Statut = 200 (Attendu: 200)
Test 7 (Admin accède aux leads) : Statut = 200 (Attendu: 200)

=== FIN DES TESTS - TOUT EST CONFORME ! ===
```

---

## Gestion des Versions (Git)
Toutes les modifications ont été auditées, ajoutées et validées proprement sur le dépôt Git sous le message de commit standard :
> **"Add authentication and role-based permissions"**
