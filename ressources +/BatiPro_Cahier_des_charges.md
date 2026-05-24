■

**BatiPro**

Plateforme ERP · Travaux & Construction

Maroc & International

**CAHIER DES CHARGES COMPLET**

Version 1.0 · Mai 2026 · Confidentiel

*Conçu avec Claude · Anthropic · claude.ai*

# **1\. Contexte & Objectifs**

## **1.1 Description du projet**

BatiPro est un ERP/CRM complet, conçu spécifiquement pour les entreprises de travaux divers au Maroc et à l'international. Il couvre l'intégralité du cycle d'une affaire : du premier contact commercial jusqu'au solde de la retenue de garantie, en passant par la gestion de chantier, le pointage du personnel, la comptabilité et la paie.

## **1.2 Entreprise cible**

* TPE/PME du BTP — 5 à 200 employés

* Types de travaux couverts :

  * Gros œuvre : maçonnerie, coffrage, ferraillage, béton armé, fondations

  * Enveloppe : étanchéité, ravalement, isolation thermique ITE, façades

  * Second œuvre : peinture & enduits, carrelage & revêtements, faux plafonds

  * Menuiseries : aluminium, bois, PVC, vitrerie

  * Fluides : plomberie & sanitaire, climatisation & VMC

  * Électricité : courants forts, courants faibles, domotique

  * VRD : voirie, réseaux divers, terrassement, démolition

  * Aménagement intérieur : cloisons, mobilier, décoration

* Marché principal Maroc (TVA 20%, CNSS, IGR, mentions légales ICE/IF/RC)

* Extension internationale : France, Sénégal, Côte d'Ivoire, Qatar (multi-devises, multi-fiscalités)

## **1.3 Problèmes résolus**

* Pointage du personnel fait sur papier ou WhatsApp dans 90% des TPE BTP marocaines

* Aucun lien direct entre le chantier et la comptabilité (paie journaliers, achats, situations)

* Pas de visibilité temps réel sur la rentabilité par chantier

* Gestion des documents non standardisée, sans mentions légales correctes

* Outils existants (Odoo, Sage BTP) trop génériques, coûteux à paramétrer

# **2\. Architecture des Modules**

## **2.1 Vue d'ensemble**

| Module | Fonctionnalités clés | Utilisateurs |
| :---- | :---- | :---- |
| Dashboard | KPIs temps réel, alertes, agenda, CA par type de travaux | Directeur, Gérant |
| Chantiers | Fiche chantier, planning, journal quotidien, milestones, photos | Chef chantier, Direction |
| Pointage & Paie | Présence CDI/CDD/journaliers, HS, calcul journée, lien paie | Chef chantier, RH |
| RH & Paie | Fiches employés, CNSS/IGR/ancienneté, bulletins, virements | RH, Comptable |
| Facturation | Situations, factures TVA 20%, retenue garantie 10% | Comptable, Direction |
| Trésorerie | Flux, créances, prévisions, filtres par chantier | Comptable, Direction |
| Clients & CRM | Pipeline kanban, prospects → contrat, relances | Commercial, Direction |
| Achats & Stock | Bons de commande, réception, alertes rupture, conso/chantier | Chef chantier, Acheteur |
| Rapports | Rentabilité, productivité MO, CA/type, international | Direction |
| Documents PDF | Facture, devis, situation, contrat — convertibles entre eux | Tous rôles |
| Paramètres | Société ICE/IF/RC, utilisateurs, rôles, TVA, CNSS, notifs | Admin |

## **2.2 Rôles et permissions**

| Rôle | Accès | Modules accessibles |
| :---- | :---- | :---- |
| Directeur/Gérant | Complet | Tous les modules sans restriction |
| Chef de chantier | Partiel | Chantiers, Pointage, Journal, Achats limités, Rapports chantier |
| Comptable/RH | Finance | Facturation, Paie, Trésorerie, CNSS, Déclarations fiscales |
| Commercial | CRM uniquement | Clients, Pipeline, Devis (lecture factures) |

# **3\. Module Pointage — Spécification Détaillée**

## **3.1 Fonctionnement général**

Le chef de chantier saisit chaque matin (sur tablette ou mobile) la présence de son équipe. La fiche est organisée en deux sections : personnel permanent (CDI/CDD) et personnel journalier (temporaire).

## **3.2 Fonctionnalités pointage**

* Toggle de présence par ouvrier (présent / absent) avec motif si absent

* Sélection des heures supplémentaires : 0h à 4h, calculées à 125% du taux horaire

* Ajout à la volée d'un journalier non inscrit : nom, métier, taux journalier MAD

* Affectation des tâches du jour par poste (maçonnerie, ferraillage, électricité…)

* Calcul instantané de la masse salariale de la journée

* Validation et envoi automatique vers le module RH/paie

* Journal de chantier intégré : incidents, livraisons, visites, notes

## **3.3 Chaîne pointage → comptabilité**

Chaque validation de fiche de pointage déclenche la chaîne suivante :

| Étape | Action | Responsable |
| :---- | :---- | :---- |
| 1 — Saisie | Chef de chantier saisit présences, HS et tâches | Chef chantier |
| 2 — Calcul | Système calcule : MAD/j × présence \+ HS à 125% | Auto |
| 3 — Cumul RH | Cumul mensuel alimenté en temps réel dans module RH | Auto |
| 4 — Bulletin | Comptable génère les bulletins de paie en fin de mois | Comptable |
| 5 — Virement | Fichier virement bancaire (CIH/Attijariwafa/BCP) généré | Comptable |
| 6 — Déclaration | Export CNSS mensuel pré-rempli à partir des cumuls | Comptable/RH |

## **3.4 Personnel temporaire (journaliers)**

* Registre des journaliers habitués avec taux journalier mémorisé

* Ajout rapide sur fiche sans création de fiche RH complète

* Historique des présences par journalier (justificatifs CNSS si régularisation)

* Calcul automatique du cumul mensuel → déclaration CNSS optionnelle

* Reçu de paiement journalier imprimable (PDF simple, signable sur tablette)

# **4\. Fiscalité & Réglementation Marocaine**

## **4.1 Cotisations CNSS — Secteur BTP 2026**

| Branche | Part salariale | Part patronale | Plafond/mois |
| :---- | :---- | :---- | :---- |
| Assurance maladie (AMO) |  |  |  |
| Retraite \+ Invalidité |  |  |  |
| Allocations familiales |  |  |  |
| Accidents du travail BTP (spéc.) |  |  |  |
| TOTAL |  |  |  |

*Note : Le taux AT de 3,26% est spécifique au secteur BTP — supérieur au taux industrie général (1,5%). Ce paramètre est verrouillé dans l'application.*

## **4.2 Barème IGR 2026 — art. 73 CGI**

| Tranche annuelle (MAD) | Taux marginal | Déduction | Impôt max tranche |
| :---- | :---- | :---- | :---- |
| 0 — 30 000 |  |  |  |
| 30 001 — 50 000 |  |  |  |
| 50 001 — 60 000 |  |  |  |
| 60 001 — 80 000 |  |  |  |
| 80 001 — 180 000 |  |  |  |
| Au-delà 180 000 |  |  |  |

* Déduction frais professionnels : 20% du brut imposable (plafond 30 000 MAD/an)

* Déduction charge de famille : 360 MAD/an par personne à charge (max 6\)

## **4.3 Mentions légales obligatoires sur documents**

* ICE — Identifiant Commun de l'Entreprise (15 chiffres)

* IF — Identifiant Fiscal

* RC — Registre de Commerce (tribunal compétent \+ numéro)

* CNSS — Numéro d'affiliation employeur

* TVA au taux de 20% sur toutes prestations BTP

* Retenue de garantie 10% (libérée à la réception définitive)

# **5\. Module Documents & Conversions**

## **5.1 Types de documents**

* Devis : quantitatif estimatif, validité 30 jours, signature en ligne

* Contrat de marché : reprend devis accepté \+ délais, pénalités, RG

* Situation de travaux mensuelle : avancement par poste (%), déduction situation précédente

* Facture : générée depuis situation validée, TVA 20%, RG 10%

* Avoir : annulation totale ou partielle, référence facture d'origine

* Reçu journalier : pour journaliers, signable sur tablette

## **5.2 Matrice de conversion**

| Conversion | Description |
| :---- | :---- |
| Devis → Contrat |  |
| Devis → Facture |  |
| Situation → Facture |  |
| Facture → Avoir |  |
| Contrat → Chantier |  |

## **5.3 Données préservées lors des conversions**

* Informations client (nom, adresse, ICE, IF)

* Lignes de postes (désignation, quantité, unité, prix unitaire, TVA)

* Conditions de paiement et retenue de garantie

* Mentions légales de la société émettrice

* Historique des versions (audit trail complet)

# **6\. Stack Technique Recommandée**

| Couche | Technologie | Justification |
| :---- | :---- | :---- |
| Frontend |  |  |
| UI / Design |  |  |
| État global |  |  |
| Backend API |  |  |
| ORM |  |  |
| Base de données |  |  |
| Auth |  |  |
| Auth |  |  |
| PDF |  |  |
| Hébergement |  |  |
| CI/CD |  |  |
| Mobile (ph. 2\) |  |  |

## **6.1 Modèle de données principal**

* Entreprise → Utilisateurs (rôles : directeur, chef, comptable, commercial)

* Chantier → Postes de travaux, Journal, Équipe affectée, Documents, Mouvements

* Personnel → CDI/CDD/Journalier, Pointages journaliers, Bulletins de paie

* Pointage → Chantier × Personnel × Date × Heures × Taux journalier

* Document → Devis | Situation | Facture | Contrat (type discriminant, même table)

* Mouvement → Trésorerie, Chantier, Catégorie, Type entrée/sortie, Statut

* Stock → Article, Chantier (affectation), Fournisseur, Bon de commande, Réception

# **7\. Roadmap de Développement**

## **Phase 1 — MVP (3 mois)**

* Authentification multi-rôle \+ gestion des utilisateurs

* Module Chantiers : fiche, journal de chantier, milestones

* Pointage journalier (CDI/CDD \+ journaliers) \+ calcul masse salariale

* Facturation : devis, situations de travaux, factures avec mentions légales

* Templates PDF (facture, devis, situation) avec conversion

## **Phase 2 — Core ERP (3 mois)**

* RH & Paie complète : CNSS, IGR, bulletins, export virement

* Trésorerie : flux entrées/sorties, créances, prévisions

* Achats & Stock : bons de commande, réception, alertes rupture

* CRM Clients : pipeline kanban, relances automatiques

* Rapports & Analytique : rentabilité/chantier, productivité MO, CA par type

## **Phase 3 — International & Mobile (6 mois)**

* Application mobile React Native pour chef de chantier (offline first)

* Multi-devises : MAD, EUR, USD, XOF (Afrique de l'Ouest)

* Multi-fiscalités : France TVA, Sénégal, Côte d'Ivoire

* Signature électronique des devis et contrats

* Intégration bancaire CIH / Attijariwafa / BCP (fichiers virement)

* Portail client : consultation des situations, validation devis en ligne

## **7.1 Budget estimatif**

| Profil | Phase | Durée | Coût estimé |
| :---- | :---- | :---- | :---- |
| Dev Full-Stack senior |  |  |  |
| Dev Full-Stack × 2 |  |  |  |
| Dev Mobile \+ Backend |  |  |  |
| Infra & hébergement |  |  |  |

# **8\. Instructions pour l'Agent Développeur**

## **8.1 Comment utiliser ce document**

Ce cahier des charges a été conçu avec Claude (Anthropic) lors d'une session de conception interactive. Tous les prototypes d'interface, les calculs fiscaux et la logique métier ont été validés visuellement dans des widgets interactifs. L'agent développeur peut :

* Utiliser ce document comme référence principale pour toutes les questions de scope

* Demander à Claude de générer du code pour un module spécifique en référençant ce document

* Itérer sur les maquettes HTML/React depuis les widgets de cette session Claude

* Partager ce PDF directement dans son contexte de travail (Cursor, Windsurf, Claude Code…)

## **8.2 Design system**

* Couleur principale : \#C85A2A (terracotta BTP)

* Sidebar sombre : \#1C1C1C — contraste fort, professionnel

* Typographie : Inter ou Geist Sans (disponibles sur Google Fonts)

* Composants : shadcn/ui avec overrides couleur BatiPro

* Icons : Tabler Icons outline uniquement (ti-\*)

* Langue principale : français — champs de données bilingues FR/AR pour arabisation future

## **8.3 Conventions de code**

* TypeScript strict (no any) — frontend et backend

* Nommage : camelCase variables, PascalCase composants, SCREAMING\_SNAKE constantes

* Commits : Conventional Commits (feat:, fix:, chore:, docs:)

* Validation : Zod côté backend, React Hook Form \+ Zod côté frontend

* Réponses API : toujours { success, data, error, message } en JSON

## **8.4 Sécurité & conformité**

* JWT avec refresh token (access 15min, refresh 7 jours)

* Hashage bcrypt — salt rounds \= 12

* RBAC strict : chaque route API vérifie le rôle avant d'exécuter

* Audit log : toute modification sensible journalisée (userId, timestamp, before/after)

* Conformité CNDP Maroc (équivalent RGPD local) — données personnelles chiffrées

## **8.5 Livrables attendus**

* Dépôt GitHub privé avec README complet, .env.example, instructions d'installation

* Base de données PostgreSQL avec migrations Prisma versionnées

* API REST documentée avec Swagger / OpenAPI

* Tests unitaires sur les calculs fiscaux (CNSS, IGR, situations de travaux)

* Interface responsive : bureau (gestionnaire) \+ tablette 10" (chef de chantier)

* Rapport de livraison par phase avec captures d'écran et démo vidéo

*BatiPro ERP · Document confidentiel · © 2026 · Tous droits réservés*