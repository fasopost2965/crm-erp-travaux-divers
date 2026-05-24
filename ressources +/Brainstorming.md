### **Vision : CRM/ERP pour une entreprise de travaux au Maroc**

#### **🏗️ Inspirations existantes**

| Modèle | Ce qu'on en prend |
| ----- | ----- |
| **Odoo** | Structure modulaire, devis → facture intégrée |
| **Procore** | Suivi chantier, gestion des sous-traitants |
| **Monday.com** | Vue kanban des projets, timeline visuelle |
| **Sage BTP** | Comptabilité bâtiment, situation de travaux |

Mais ces outils sont trop génériques ou trop coûteux pour une PME marocaine. L'idéal : quelque chose de **plus léger, arabisable, adapté au contexte local** (TVA 20%, facturation en MAD, bon de commande fournisseur local).

---

#### **⚙️ Modules essentiels**

**1\. Gestion Commerciale**

* Prospects → Devis → Bon de commande → Contrat  
* Métrés et quantitatifs automatiques  
* Situations de travaux mensuelles (avancement %)

**2\. Gestion de Chantier**

* Fiche chantier (localisation, chef de chantier, délai)  
* Planning Gantt simplifié  
* Journal de chantier quotidien (photos, incidents)  
* Suivi main-d'œuvre par chantier

**3\. RH & Paie**

* Fiches ouvriers/techniciens  
* Pointage journalier par chantier  
* Calcul paie selon barème BTP Maroc (CNSS, IGR)

**4\. Achats & Stock**

* Bons de commande fournisseurs  
* Réception matériaux par chantier  
* Stock consommables (ciment, fer, peinture…)

**5\. Comptabilité & Trésorerie**

* Facturation client (TVA 20%)  
* Suivi encaissements / retards  
* Tableau de bord trésorerie (entrées/sorties)  
* États financiers simples

**6\. Tableau de Bord Direction**

* CA réalisé vs prévu  
* Rentabilité par chantier  
* Alertes : retards de paiement, chantiers en dépassement

---

#### **🎨 Design**

Ton : **industriel-moderne**, sobre mais sérieux. Couleurs terracotta/ardoise inspirées du bâtiment marocain. Interface en français avec option arabe (RTL). Dense mais lisible, pensé pour être utilisé sur tablette sur chantier.

Laisse-moi te construire le prototype :

V

visualize

V

visualize show\_widget

Voilà le prototype du dashboard \! Voici le récapitulatif de la vision complète :

---

#### **Pourquoi ce design ?**

**Sidebar sombre \+ contenu clair** — inspiré de Procore et Linear. Le contraste fort oriente immédiatement l'œil. La couleur terracotta (`#C85A2A`) rappelle la brique et la terre marocaine, sans tomber dans le folklorique.

**Dense mais lisible** — une PME BTP n'a pas besoin de joliesse, elle a besoin d'info rapide : statut chantier, alertes, trésorerie. Tout tient sur un seul écran.

---

#### **Stack technique recommandée**

Pour construire le vrai produit, je conseillerais :

**Frontend** : React \+ Tailwind — léger, rapide à développer, facilement arabisable (direction RTL avec un simple attribut)

**Backend** : Node.js ou Django (Python) \+ PostgreSQL

**Hébergement** : VPS OVH Maroc ou AWS Bahreïn (latence faible)

**Facturation** : génération PDF côté serveur (WeasyPrint), conformité fiscale marocaine (mentions légales ICE, IF, RC obligatoires)

---

#### **Ce qui le différencierait d'Odoo**

Odoo est trop générique et coûteux à paramétrer. Un produit local gagnerait sur : les **situations de travaux** (avancement mensuel facturé au maître d'ouvrage), le **barème CNSS/BTP marocain**, les **bons de livraison** avec signature chauffeur, et une interface mobile légère pour les chefs de chantier sur tablette.

Tu veux que j'approfondisse un module en particulier — le suivi chantier, la facturation, ou la paie ?

## **Vous avez dit : Montre-moi le module chantiers du CRM**

Montre-moi le module chantiers du CRM

23:11

## **Claude a répondu : Voici le module chantiers complet et interactif \!**

V

visualize

V

visualize show\_widget

Voici le module chantiers complet et interactif \! Tu peux :

* Cliquer sur chaque chantier dans la liste à gauche pour voir sa fiche détaillée  
* Filtrer par statut (en cours, retard, terminés)  
* Naviguer entre les 4 onglets : Aperçu, Journal, Équipe, Documents  
* Les boutons "↗" simulent des actions vers d'autres modules

Quelques points de conception notables :

La frise de jalons dans l'Aperçu se remplit automatiquement selon le pourcentage d'avancement — c'est ce qu'on appelle la "situation de travaux" en BTP. Le journal de chantier suit un format chronologique avec catégorisation (incident, livraison, visite, note) — indispensable en cas de litige. Le pointage dans l'onglet Équipe alimente directement le calcul de paie.

Tu veux voir un autre module — la facturation / situation de travaux, ou la trésorerie ?

## **Vous avez dit : facturation / situation de travaux, ou la trésorerie**

facturation / situation de travaux, ou la trésorerie

23:15

## **Claude a répondu : Je te montre les deux : d'abord la situation de travaux (la pièce maîtresse du BTP marocain), puis la trésorerie.**

Je te montre les deux : d'abord la situation de travaux (la pièce maîtresse du BTP marocain), puis la trésorerie. Ce sont deux écrans distincts mais liés — une situation approuvée génère automatiquement une facture qui alimente la trésorerie.

V

visualize

V

visualize show\_widget

Les deux modules sont là, tu peux basculer entre eux avec les boutons en haut. Voici ce qui rend chaque écran spécifique au BTP marocain :

**Situation de travaux** — clique sur les 4 situations (Fév à Mai) pour voir l'avancement se recalculer dynamiquement. La logique est typiquement BTP : chaque poste a un % cumulé précédent \+ % ce mois, et le système calcule automatiquement la TVA 20%, puis déduit la retenue de garantie de 10% (obligatoire au Maroc, libérée à la réception définitive). C'est la pièce comptable qui justifie chaque facture mensuelle.

**Trésorerie** — le graphique à barres montre 6 mois d'historique entrées/sorties. Le tableau des créances impayées avec âge du retard est crucial : en BTP marocain les délais de paiement sont souvent de 60 à 90 jours. La prévision sur 3 mois permet d'anticiper les tensions de cash avant de prendre de nouveaux chantiers.

Le flux logique dans le vrai produit serait : situation validée → facture générée automatiquement → intégrée dans le suivi trésorerie → relance automatique si impayée à J+30.

Tu veux qu'on attaque le module RH & paie (calcul CNSS, IGR, barème BTP), ou tu préfères qu'on parle de la stack technique pour développer tout ça ?

## **Vous avez dit : on attaque le module RH & paie (calcul CNSS, IGR, barème BTP),**

on attaque le module RH & paie (calcul CNSS, IGR, barème BTP),

23:18

## **Claude a répondu : Le module est entièrement fonctionnel et interactif — voici ce que tu peux faire :**

V

visualize

V

visualize show\_widget

Le module est entièrement fonctionnel et interactif — voici ce que tu peux faire :

**Onglet "Fiches & bulletins"** — clique sur chaque ouvrier pour voir son bulletin de paie calculé en temps réel. Chaque bulletin détaille exactement la mécanique : salaire de base au prorata des jours travaillés, prime d'ancienneté selon la grille BTP (2% par an jusqu'à 5 ans, puis 5%/10%/15%/20%/25%), heures supplémentaires à 125%, puis les trois branches CNSS salariale, et enfin le calcul IGR par tranches.

**Onglet "Simulateur"** — glisse les sliders pour simuler n'importe quel profil. La barre colorée montre visuellement la répartition net/CNSS/IGR. Le coût total employeur (brut \+ charges patronales 21,09%) apparaît en bas — indispensable pour chiffrer un devis.

**Onglet "Récap mensuel"** — vue d'ensemble pour préparer les virements et la déclaration CNSS mensuelle.

**Onglet "Barème IGR"** — les tables officielles 2026 pour référence rapide.

Quelques particularités du BTP marocain bien intégrées : le taux AT (accidents du travail) à 3,26% contre 1,5% pour l'industrie classique, le plafond CNSS retraite à 6 000 MAD/mois, et la déduction forfaitaire de 20% pour frais professionnels avant calcul IGR.

Tu veux qu'on parle maintenant de la stack technique pour construire tout ça, ou d'un autre aspect du produit ?

## **Vous avez dit : Montre-moi tous les mouvements de trésorerie filtrés par chantier**

Montre-moi tous les mouvements de trésorerie filtrés par chantier

23:33

## **Claude a répondu : Le module est entièrement filtrable et interactif.**

V

visualize

V

visualize show\_widget

Le module est entièrement filtrable et interactif. Voici ce que tu peux faire :

**Filtres cumulables** — clique sur un chantier dans la colonne gauche pour isoler ses mouvements. Combine ensuite avec les filtres de type (encaissements / décaissements) et les catégories colorées (achat matériaux, paie, CNSS…). Tous les KPIs en haut se recalculent instantanément.

**Lecture rapide** — le chantier Résidence Al Fath est en territoire positif (+582 200 MAD), la Villa Aïn Diab aussi grâce à l'encaissement final de Idrissi. En revanche l'entrepôt Aïn Sebaâ est encore déficitaire : l'avance reçue ne couvre pas encore les achats acier et la sous-traitance étanchéité.

**Balance par chantier** en bas à droite — les barres horizontales vertes/rouges donnent la rentabilité de trésorerie de chaque projet d'un coup d'œil, sans avoir à additionner les lignes.

La barre de recherche en haut à droite permet aussi de taper une référence fournisseur, un nom, ou un numéro de bon de commande pour retrouver un mouvement précis.

Tu veux qu'on passe maintenant à la stack technique pour implémenter tout ça, ou explorer un autre module ?

## **Vous avez dit : propose moi un ou deux autres modules importants, montre moi les login page aussi**

propose moi un ou deux autres modules importants, montre moi les login page aussi faire aussi le module paramettre pour tous les régalges, brefs liste aussi les différents modules

23:41

## **Claude a répondu : Voici d'abord la liste complète des modules, puis je te construis tout en interactif.**

Voici d'abord la liste complète des modules, puis je te construis tout en interactif.

---

#### **Modules complets du CRM/ERP BatiPro**

**Déjà vus :** Dashboard · Chantiers · Facturation/Situations · Trésorerie · RH & Paie

**À construire maintenant :**

1. **Login / Onboarding** — authentification multi-rôle (directeur, chef de chantier, comptable)  
2. **Clients & Prospects** — CRM commercial, pipeline devis → contrat  
3. **Achats & Stock** — bons de commande fournisseurs, réception matériaux, inventaire  
4. **Rapports & Analytique** — rentabilité par chantier, tableaux de bord direction  
5. **Paramètres** — société, utilisateurs, rôles, TVA, CNSS, notifications

Je te montre la **page login**, le **module Clients/CRM**, et les **Paramètres** dans un seul widget multi-écrans :

V

visualize

V

visualize show\_widget

Trois écrans complets à explorer en cliquant sur les onglets en haut. Voici les points clés de chacun :

---

**Page de connexion** — le système de sélection de rôle avant même de taper le mot de passe est une décision UX forte : ça adapte l'interface dès la connexion. Un directeur voit tout, un chef de chantier voit uniquement ses chantiers, un comptable accède uniquement à la finance et la paie. Le bouton "Se connecter" déclenche une alerte de confirmation. L'option SSO Google Workspace cible les entreprises qui ont déjà des comptes Google pro.

**Module Clients & CRM** — le kanban pipeline (Prospect → Devis → Négociation → Signé → Perdu) est l'outil central d'une TPE BTP : il permet de visualiser en un coup d'œil où en est chaque affaire. Les montants affichés sur chaque deal permettent de prioriser les relances commerciales. Le feed d'activité à droite joue le rôle de journal de bord commercial.

**Paramètres** — explore les sections dans la sidebar gauche : "Ma société" contient les mentions légales obligatoires sur les factures marocaines (ICE, IF, RC, CNSS). "Barèmes CNSS" verrouille les taux réglementaires pour éviter les erreurs. "Notifications" permet de configurer les alertes automatiques. "Facturation" gère la numérotation et les conditions de paiement par défaut.

---

#### **Récapitulatif complet des modules BatiPro**

| Module | Statut démo |
| ----- | ----- |
| Dashboard direction | ✅ Fait |
| Chantiers (liste \+ fiche \+ journal) | ✅ Fait |
| Facturation & situations de travaux | ✅ Fait |
| Trésorerie & flux | ✅ Fait |
| Mouvements par chantier | ✅ Fait |
| RH & Paie (CNSS \+ IGR) | ✅ Fait |
| Login multi-rôle | ✅ Fait |
| Clients & CRM pipeline | ✅ Fait |
| Paramètres complets | ✅ Fait |
| Achats & Stock | À construire |
| Rapports & Analytique | À construire |

Tu veux qu'on attaque maintenant la stack technique pour développer le vrai produit, ou le module Achats & Stock ?

## **Vous avez dit : je veux que les fonctioonnalités modules soient pertinents pour une entreprise de travaux divers marocaine et meme internationale, Il faut intégrere les servic…**

je veux que les fonctioonnalités modules soient pertinents pour une entreprise de travaux divers marocaine et meme internationale, Il faut intégrere les services et types de taches les plus fréquentn je veux pouvoir gérer aussi le personnel temporaire et journaliser, le chef de chantier doit pouvoir gerer une fiche de pointage journalier et meme etre lier à la comptabilité pour des fiches de paie biensur les modules achat & stock le module rapport aussi et en fin de jolie template de facture et devis en pdf avec toutes les informations convertibles aussi ( ex facture vers devis, devis vers projet etc. )

23:52

## **Claude a répondu : Excellente vision — tu décris un ERP BTP complet de niveau pro.**

Excellente vision — tu décris un ERP BTP complet de niveau pro. Laisse-moi d'abord structurer tout ça, puis je construis les écrans.

---

#### **Architecture finale BatiPro — ERP Travaux Maroc & International**

**Types de travaux intégrés (les plus fréquents)**

Gros œuvre, maçonnerie, coffrage, ferraillage, étanchéité, ravalement, peinture & enduits, carrelage & revêtements, menuiserie aluminium/bois/PVC, plomberie & sanitaire, électricité courants forts/faibles, climatisation & VMC, faux plafonds, isolation thermique, aménagement intérieur, voirie & réseaux divers (VRD), démolition, terrassement.

**Personnel temporaire** — pointage journalier chef de chantier → calcul automatique paie journalière → bulletin mensuel comptabilité.

---

V

visualize

V

visualize show\_widget

Quatre onglets à explorer, voici ce qui est interactif :

**Pointage & Paie** — les toggles de présence fonctionnent en temps réel, les KPIs en haut se recalculent instantanément. Tu peux ajouter un journalier via le formulaire du bas (tape un nom, un métier, un taux journalier et clique \+). Les heures supp se sélectionnent par dropdown et s'ajoutent automatiquement à la masse salariale de la journée. Le flux en bas illustre la chaîne : pointage → calcul → cumul mensuel → bulletin comptable → virement.

**Achats & Stock** — le tableau de stock avec les barres de niveau affiche en rouge les 4 produits sous seuil d'alerte (fer HA, peinture, carrelage). Les bons de commande récents sont listés avec leur statut livraison.

**Rapports** — rentabilité par chantier avec marge en %, productivité MO en MAD/jour·ouvrier, et répartition géographique pour le développement international (France, Sénégal, Qatar, Côte d'Ivoire en pipeline).

**Documents PDF** — clique sur les boutons "Devis", "Facture", "Situation" dans la topbar pour switcher entre les templates. Les boutons "Convertir en" permettent de basculer d'un type à l'autre en conservant toutes les données. Chaque document inclut les mentions légales obligatoires au Maroc (ICE, IF, RC, CNSS) et les conditions de paiement.

---

#### **Ce qui ferait vraiment la différence vs. un logiciel générique**

Le pointage journalier par le chef de chantier sur tablette, directement relié à la paie, est l'élément le plus différenciant pour une TPE BTP marocaine — aujourd'hui ça se fait encore sur papier ou WhatsApp dans 90% des cas. La conversion instantanée devis → situation → facture avec maintien de la numérotation et des mentions légales locales est le second avantage majeur.

Tu veux qu'on passe maintenant à la stack technique pour construire le vrai produit, ou qu'on détaille l'architecture de base de données ?

