# DECISIONS.md - Registre des décisions techniques et d'architecture

Ce document trace de façon historique les choix de conception, de technologies et d'implémentation effectués sur le projet.

---

## 1. Choix du Framework et de la Version
- **Décision** : Utiliser **Laravel 11.x** et **PHP 8.3**.
- **Date** : 2026-05-21
- **Statut** : Acté
- **Contexte** : Laravel 11.x apporte des performances accrues, un squelette d'application allégé et des fonctionnalités modernes de gestion des tâches d'arrière-plan et de sécurité. PHP 8.3 est pleinement supporté et installé dans WampServer localement.

---

## 2. Choix de la Base de Données
- **Décision** : Utiliser **PostgreSQL** au lieu de SQLite ou MySQL.
- **Date** : 2026-05-21
- **Statut** : Acté
- **Contexte** : PostgreSQL offre une excellente gestion de la concurrence, des transactions complexes et du typage de données personnalisées, ce qui est parfait pour un ERP gérant des calculs de factures, de devis et des données financières critiques.

---

## 3. Architecture Modulaire Monolithique
- **Décision** : Structurer le code avec un backend robuste et centralisé, organisé par dossiers logiques (Models, Http, Services, Policies, Observers) dans `/code/backend`.
- **Date** : 2026-05-21
- **Statut** : Acté
- **Contexte** : Assure que le code est structuré, respecte les principes SOLID et permet de découpler la logique métier (Services) de la logique de transport (Controllers).
