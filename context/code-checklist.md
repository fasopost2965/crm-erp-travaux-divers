# Code Checklist

## Avant de commencer une nouvelle fonctionnalité
- [ ] Lire /context/state.md
- [ ] Lire /context/tasks.md
- [ ] Vérifier /context/decisions.md

## Pour chaque Model
- [ ] Migration créée
- [ ] Fillable défini
- [ ] Relations définies
- [ ] Soft deletes activé si nécessaire
- [ ] Timestamps activés

## Pour chaque Controller
- [ ] Resource controller
- [ ] Validation des inputs
- [ ] Policy appliquée
- [ ] Responses cohérentes

## Pour chaque migration
- [ ] Nommage clair
- [ ] Foreign keys avec onDelete/onUpdate
- [ ] Indexes sur colonnes fréquemment requêtées
- [ ] Rollback fonctionnel

## Après chaque session de code
- [ ] Tests unitaires si possible
- [ ] Code commenté si logique complexe
- [ ] /context/state.md mis à jour
- [ ] /context/session-log.md mis à jour
- [ ] Commit avec message clair

Workflow de travail :

1. Commence par /code/backend
2. Initialise Laravel si pas encore fait
3. Configure .env pour PostgreSQL
4. Crée les migrations dans l'ordre de /context/antigravity-config.md
5. Crée les Models avec relations
6. Crée les Seeders pour les rôles de base
7. Teste les migrations
8. Crée les Controllers CRUD
9. Crée les Policies
10. Définis les routes API
11. Teste les endpoints principaux

À chaque étape complétée :
- Note dans /context/state.md ce qui est fait
- Commit avec message descriptif
- Ajoute les décisions techniques dans /context/decisions.md si nécessaire
