<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\Account;
use App\Models\Contact;
use App\Models\Lead;
use App\Models\Opportunity;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\Project;
use App\Models\ProjectTask;
use App\Models\WorkLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. SEED DES ROLES
        $superAdminRole = Role::create([
            'name' => 'Super Administrateur',
            'slug' => 'super_admin',
            'description' => 'Accès global de niveau infrastructure.'
        ]);

        $adminRole = Role::create([
            'name' => 'Administrateur',
            'slug' => 'admin',
            'description' => 'Accès total à l\'ERP/CRM et configurations.'
        ]);

        $directorRole = Role::create([
            'name' => 'Directeur',
            'slug' => 'directeur',
            'description' => 'Vue décisionnelle, financière et reporting global.'
        ]);

        $commercialRole = Role::create([
            'name' => 'Commercial',
            'slug' => 'commercial',
            'description' => 'Gestion des leads, opportunités, comptes et devis.'
        ]);

        $chefChantierRole = Role::create([
            'name' => 'Chef de Chantier',
            'slug' => 'chef_chantier',
            'description' => 'Planification, affectations et suivi technique des chantiers.'
        ]);

        $technicianRole = Role::create([
            'name' => 'Technicien',
            'slug' => 'technicien',
            'description' => 'Exécution technique de terrain et déclaration des heures.'
        ]);

        $financeRole = Role::create([
            'name' => 'Responsable Financier',
            'slug' => 'finance',
            'description' => 'Suivi de la facturation, des encaissements et budgets.'
        ]);

        $rhRole = Role::create([
            'name' => 'Ressources Humaines',
            'slug' => 'rh',
            'description' => 'Gestion du personnel, contrats et validations des pointages.'
        ]);

        // Pour compatibilité avec la suite du seeder
        $pmRole = $chefChantierRole;
        $workerRole = $technicianRole;

        // 2. SEED DES UTILISATEURS
        $admin = User::create([
            'name' => 'Anass El Amrani',
            'email' => 'admin@travaux.ma',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
        ]);

        $commercial = User::create([
            'name' => 'Youssef Benjelloun',
            'email' => 'commercial@travaux.ma',
            'password' => Hash::make('password'),
            'role_id' => $commercialRole->id,
        ]);

        $pm = User::create([
            'name' => 'Khalid Alami',
            'email' => 'khalid@travaux.ma',
            'password' => Hash::make('password'),
            'role_id' => $pmRole->id,
        ]);

        $worker1 = User::create([
            'name' => 'Mustapha Ait',
            'email' => 'mustapha@travaux.ma',
            'password' => Hash::make('password'),
            'role_id' => $workerRole->id,
        ]);

        $worker2 = User::create([
            'name' => 'Rachid Berrada',
            'email' => 'rachid@travaux.ma',
            'password' => Hash::make('password'),
            'role_id' => $workerRole->id,
        ]);

        // 3. SEED DES COMPTES (ACCOUNTS - MAROC REALISTE)
        $account1 = Account::create([
            'name' => 'Al Omrane S.A. (Rabat)',
            'ice' => '001548792000145',
            'rc' => '45879',
            'patente' => '32145897',
            'iff' => '8541258',
            'email' => 'contact@alomrane.ma',
            'phone' => '+212537700011',
            'address' => 'Avenue Allal Ben Abdellah, Rabat',
            'city' => 'Rabat',
            'owner_id' => $admin->id
        ]);

        $account2 = Account::create([
            'name' => 'Casablanca Aménagement S.A.',
            'ice' => '002145873000085',
            'rc' => '65412',
            'patente' => '98547125',
            'iff' => '6523145',
            'email' => 'info@casa-amenagement.ma',
            'phone' => '+212522402030',
            'address' => 'Angle Boulevard Rachidi et Rue d\'Alger, Casablanca',
            'city' => 'Casablanca',
            'owner_id' => $commercial->id
        ]);

        // 4. SEED DES CONTACTS
        $contact1 = Contact::create([
            'account_id' => $account1->id,
            'first_name' => 'Karim',
            'last_name' => 'Tazi',
            'email' => 'k.tazi@alomrane.ma',
            'phone' => '+212661458975',
            'position' => 'Directeur Technique'
        ]);

        $contact2 = Contact::create([
            'account_id' => $account2->id,
            'first_name' => 'Laila',
            'last_name' => 'Chraibi',
            'email' => 'l.chraibi@casa-amenagement.ma',
            'phone' => '+212662879541',
            'position' => 'Chef de Département Achats'
        ]);

        // 5. SEED DES LEADS
        $lead1 = Lead::create([
            'title' => 'Rénovation Électricité Siège Régional',
            'account_name' => 'Ministère de l\'Habitat',
            'contact_name' => 'Omar Naciri',
            'email' => 'o.naciri@habitat.gov.ma',
            'phone' => '+212663985214',
            'source' => 'Appel d\'offres',
            'status' => 'Qualifié',
            'assigned_to' => $commercial->id,
            'notes' => 'Le client souhaite refaire tout le câblage électrique du rez-de-chaussée.'
        ]);

        // 6. SEED DES OPPORTUNITIES
        $opportunity1 = Opportunity::create([
            'account_id' => $account1->id,
            'lead_id' => null,
            'title' => 'Travaux de peinture extérieurs Résidence Al Baraka',
            'estimated_budget' => 250000.00,
            'probability' => 80,
            'status' => 'Proposition',
            'close_date' => Carbon::now()->addDays(30)->toDateString(),
            'assigned_to' => $commercial->id
        ]);

        $opportunity2 = Opportunity::create([
            'account_id' => $account2->id,
            'lead_id' => null,
            'title' => 'Installation Plomberie et Climatisation Bureaux Anfa',
            'estimated_budget' => 480000.00,
            'probability' => 95,
            'status' => 'Gagnée',
            'close_date' => Carbon::now()->subDays(15)->toDateString(),
            'assigned_to' => $commercial->id
        ]);

        // 7. SEED DES DEVIS & LIGNES DE DEVIS (QUOTES & QUOTEITEMS)
        // Devis 1 : En attente d'approbation (Proposition)
        $quote1 = Quote::create([
            'opportunity_id' => $opportunity1->id,
            'account_id' => $account1->id,
            'quote_number' => 'DEV-2026-0001',
            'title' => 'Devis Peinture Extérieure Résidence Al Baraka',
            'status' => 'Envoyé',
            'tva_rate' => 20.00,
            'margin_estimated' => 45000.00,
            'retention_rate' => 5.00,
            'valid_until' => Carbon::now()->addDays(60)->toDateString(),
            'created_by' => $commercial->id
        ]);

        QuoteItem::create([
            'quote_id' => $quote1->id,
            'section' => 'Préparation des supports',
            'description' => 'Décapage et nettoyage haute pression des murs extérieurs',
            'unit' => 'm²',
            'quantity' => 1200.00,
            'unit_price_ht' => 35.00,
        ]);

        QuoteItem::create([
            'quote_id' => $quote1->id,
            'section' => 'Peinture et Finition',
            'description' => 'Fourniture et application d\'une couche d\'impression et de deux couches de peinture acrylique haut de gamme',
            'unit' => 'm²',
            'quantity' => 1200.00,
            'unit_price_ht' => 140.00,
        ]);

        // Devis 2 : Accepté et transformé en chantier
        $quote2 = Quote::create([
            'opportunity_id' => $opportunity2->id,
            'account_id' => $account2->id,
            'quote_number' => 'DEV-2026-0002',
            'title' => 'Devis Plomberie et Climatisation Bureaux Anfa',
            'status' => 'Accepté',
            'tva_rate' => 20.00,
            'margin_estimated' => 95000.00,
            'retention_rate' => 10.00,
            'valid_until' => Carbon::now()->addDays(30)->toDateString(),
            'created_by' => $commercial->id
        ]);

        QuoteItem::create([
            'quote_id' => $quote2->id,
            'section' => 'Climatisation',
            'description' => 'Fourniture et pose de climatiseurs Split System Inverter 12000 BTU',
            'unit' => 'U',
            'quantity' => 8.00,
            'unit_price_ht' => 6500.00,
        ]);

        QuoteItem::create([
            'quote_id' => $quote2->id,
            'section' => 'Plomberie',
            'description' => 'Fourniture et pose de tuyauterie PPR pour alimentation d\'eau chaude/froide et évacuations PVC',
            'unit' => 'Ens',
            'quantity' => 1.00,
            'unit_price_ht' => 45000.00,
        ]);

        QuoteItem::create([
            'quote_id' => $quote2->id,
            'section' => 'Main d\'œuvre',
            'description' => 'Installation, raccordement électrique et mise en service complète',
            'unit' => 'Jour',
            'quantity' => 15.00,
            'unit_price_ht' => 1200.00,
        ]);

        // Mettre à jour les totaux réels à partir des QuoteItems
        $quote1->recalculateTotals();
        $quote2->recalculateTotals();

        // 8. SEED DU CHANTIER / PROJET (PROJECTS & TASKS & WORKLOGS)
        $project = Project::create([
            'quote_id' => $quote2->id,
            'account_id' => $account2->id,
            'title' => 'Chantier Plomberie et Climatisation Anfa',
            'description' => 'Rénovation technique des locaux professionnels au quartier Anfa, Casablanca.',
            'address' => 'Angle Boulevard Anfa et Rue Moulay Ali',
            'city' => 'Casablanca',
            'status' => 'En cours',
            'budget' => $quote2->total_ht,
            'start_date' => Carbon::now()->subDays(10)->toDateString(),
            'end_date_planned' => Carbon::now()->addDays(20)->toDateString(),
            'project_manager_id' => $pm->id
        ]);

        // Tâches
        $task1 = ProjectTask::create([
            'project_id' => $project->id,
            'title' => 'Passage des gaines et tuyauterie PPR',
            'description' => 'Rainurage des cloisons et passage de la tuyauterie PPR pour la plomberie et évacuation.',
            'status' => 'Terminé',
            'priority' => 'Haute',
            'start_date' => Carbon::now()->subDays(10)->toDateString(),
            'end_date' => Carbon::now()->subDays(5)->toDateString(),
            'assigned_to' => $worker1->id
        ]);

        $task2 = ProjectTask::create([
            'project_id' => $project->id,
            'title' => 'Pose des unités extérieures de climatisation',
            'description' => 'Fixation des supports sur façade et raccordements des unités extérieures.',
            'status' => 'En cours',
            'priority' => 'Moyenne',
            'start_date' => Carbon::now()->subDays(4)->toDateString(),
            'end_date' => Carbon::now()->addDays(2)->toDateString(),
            'assigned_to' => $worker2->id
        ]);

        // Worklogs (Heures de travail)
        WorkLog::create([
            'project_id' => $project->id,
            'project_task_id' => $task1->id,
            'user_id' => $worker1->id,
            'work_date' => Carbon::now()->subDays(9)->toDateString(),
            'hours_worked' => 8.00,
            'description' => 'Creusement de saignées et soudure tubes PPR.'
        ]);

        WorkLog::create([
            'project_id' => $project->id,
            'project_task_id' => $task1->id,
            'user_id' => $worker1->id,
            'work_date' => Carbon::now()->subDays(8)->toDateString(),
            'hours_worked' => 7.50,
            'description' => 'Pose des collecteurs et tests d\'étanchéité à l\'eau.'
        ]);

        WorkLog::create([
            'project_id' => $project->id,
            'project_task_id' => $task2->id,
            'user_id' => $worker2->id,
            'work_date' => Carbon::now()->subDays(3)->toDateString(),
            'hours_worked' => 8.00,
            'description' => 'Fixation des consoles métalliques en extérieur et pose des split units.'
        ]);

        // 9. SEED DES FACTURES & PAIEMENTS
        // Facture 1 : Acompte de 30% généré au démarrage du projet
        $invoice = Invoice::create([
            'quote_id' => $quote2->id,
            'account_id' => $account2->id,
            'invoice_number' => 'FAC-2026-0001',
            'title' => 'Facture d\'Acompte 30% - Plomberie et Climatisation Anfa',
            'type' => 'Acompte',
            'situation_percentage' => 30.00,
            'status' => 'Payée',
            'tva_rate' => 20.00,
            'due_date' => Carbon::now()->subDays(5)->toDateString()
        ]);

        // Ligne de facture d'acompte
        InvoiceItem::create([
            'invoice_id' => $invoice->id,
            'description' => 'Acompte de 30% à la commande pour le chantier Plomberie/Climatisation Anfa',
            'unit' => 'U',
            'quantity' => 1.00,
            'unit_price_ht' => $quote2->total_ht * 0.3,
        ]);

        // Recalculer le total avec TVA et retenue de garantie
        $invoice->recalculateTotals();

        // Paiement correspondant à l'acompte (entièrement encaissé)
        Payment::create([
            'invoice_id' => $invoice->id,
            'amount' => $invoice->total_ttc,
            'payment_date' => Carbon::now()->subDays(7)->toDateString(),
            'payment_method' => 'Virement',
            'reference' => 'VIR-85472149520',
            'bank' => 'Attijariwafa Bank',
            'status' => 'Encaissé',
            'notes' => 'Paiement d\'acompte reçu avec succès.'
        ]);
        
        // Mettre à jour le statut de la facture à payée
        $invoice->update(['status' => 'Payée']);
    }
}
