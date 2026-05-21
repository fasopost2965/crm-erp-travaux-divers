# MASTER-BRIEF.md - Cahier des charges du CRM/ERP Travaux Divers

Ce document définit les spécifications fonctionnelles et techniques pour le CRM/ERP conçu pour une entreprise de travaux divers (BTP, second œuvre, rénovation, électricité, plomberie, peinture) opérant au Maroc.

## 1. Objectif du projet
Fournir un outil backend robuste (Laravel 11.x, PostgreSQL) capable de gérer le cycle complet d'une affaire de travaux divers :
- De la détection du prospect (Lead) à la gestion de la relation client (CRM).
- Du chiffrage précis (Devis/Quotes) à la facturation (Invoices) et encaissement (Payments).
- De la planification des travaux à la gestion opérationnelle du chantier (Projects, Tasks, WorkLogs, Photos et Documents).

---

## 2. Stack Technique Actée
- **Langage & Framework** : PHP 8.3 / Laravel 11.x (dernière version stable).
- **Base de données** : PostgreSQL (avec contraintes d'intégrité, clés étrangères et indexations).
- **Sécurité & Rôles** : Système RBAC (Role-Based Access Control) natif et Laravel Policies.
- **API** : RESTful avec Resources JSON Laravel.

---

## 3. Architecture des Données (Périmètre du MVP)

L'application est structurée autour de trois grands modules :

### A. Module CRM (Gestion Relation Client)
1. **User / Role** : Utilisateurs internes (Administrateurs, Commerciaux, Conducteurs de travaux/Chefs de projet, Ouvriers).
2. **Account** : Entreprises clientes ou prospects (Raison sociale, ICE - Identifiant Commun de l'Entreprise, RC, Patente, Ville, etc.).
3. **Contact** : Interlocuteurs physiques au sein des Accounts.
4. **Lead** : Pistes commerciales ou demandes initiales (origine, statut: Nouveau, Qualifié, Perdu).
5. **Opportunity** : Opportunités commerciales qualifiées avec budget estimé et probabilité de succès.

### B. Module Ventes (Sales & Chiffrage)
1. **Quote** : Devis détaillés. Il doit supporter des taux de TVA marocains (normalement 20% pour les travaux, parfois 7% ou 14% selon les cas spécifiques). Il intègre les marges, le montant total HT/TTC et le statut (Brouillon, Envoyé, Accepté, Refusé).
2. **QuoteItem** : Lignes du devis structurées (Fourniture de matériel, Main d'œuvre, Matériel de chantier, avec désignation, unité, quantité, prix unitaire HT).
3. **Invoice** : Factures. Supporte la facturation par situation de travaux (pourcentage d'avancement du chantier).
4. **InvoiceItem** : Lignes de facturation.
5. **Payment** : Suivi des règlements (Acompte, Situations, Solde) avec mode de paiement (Virement, Chèque, Effet, Espèces) et banque émettrice.

### C. Module Projets (Gestion de Chantiers)
1. **Project** : Chantiers physiques. Lié à un Devis accepté et à un Client. Contient le lieu, la date de début, la date de fin prévue, le budget alloué et le statut (À commencer, En cours, En pause, Livré, Clôturé).
2. **ProjectTask** : Tâches de chantier (Terrassement, Gros œuvre, Électricité, Peinture...) avec statut et responsables.
3. **WorkLog** : Suivi des heures de présence et de travail des ouvriers sur chaque chantier.
4. **ProjectPhoto** : Suivi visuel de l'avancement (polymorphique pour pouvoir être réutilisé).
5. **ProjectDocument** : Fiches techniques, plans d'exécution, PV de réception de chantier.

---

## 4. Règles de Gestion Spécifiques au Maroc
- **ICE (Identifiant Commun de l'Entreprise)** : Obligatoire pour toutes les factures et comptes d'entreprises au Maroc.
- **TVA** : Taux par défaut à 20% pour les travaux de construction et rénovation.
- **Retenue de garantie** : Optionnelle (généralement 5% à 10% retenus par le client jusqu'à la réception définitive du chantier).
- **Règlementation des paiements** : Suivi strict des chèques et des effets de commerce avec leurs dates d'échéance.
