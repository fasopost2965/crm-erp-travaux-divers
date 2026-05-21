<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DirectorDashboardResource;
use App\Http\Resources\CommercialDashboardResource;
use App\Http\Resources\ProjectManagerDashboardResource;
use App\Http\Resources\FinanceDashboardResource;
use App\Models\Invoice;
use App\Models\Quote;
use App\Models\Project;
use App\Models\Lead;
use App\Models\Opportunity;
use App\Models\Activity;
use App\Models\ProjectTask;
use App\Models\WorkLog;
use App\Models\ProjectPhoto;
use App\Models\Payment;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Director Dashboard
     * Accessible by: directeur, admin, super_admin
     */
    public function director()
    {
        $now = Carbon::now();

        // 1. CA du mois (invoices issued in current month, status != Brouillon)
        $turnoverMonth = Invoice::where('status', '!=', 'Brouillon')
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->sum('total_ht');

        // 2. Devis envoyés (status = Envoyé)
        $quotesSentCount = Quote::where('status', 'Envoyé')->count();
        $quotesSentAmount = Quote::where('status', 'Envoyé')->sum('total_ht');

        // 3. Devis gagnés (status = Accepté)
        $quotesWonCount = Quote::where('status', 'Accepté')->count();
        $quotesWonAmount = Quote::where('status', 'Accepté')->sum('total_ht');

        $totalQuotes = Quote::where('status', '!=', 'Brouillon')->count();
        $conversionRate = $totalQuotes > 0 ? ($quotesWonCount / $totalQuotes) * 100 : 0;

        // 4. Projets actifs (À commencer, En cours)
        $activeProjectsCount = Project::whereIn('status', ['À commencer', 'En cours'])->count();

        // 5. Factures impayées (status != Payée and status != Brouillon)
        $unpaidInvoicesCount = Invoice::whereNotIn('status', ['Payée', 'Brouillon'])->count();
        $unpaidInvoicesAmount = Invoice::whereNotIn('status', ['Payée', 'Brouillon'])->sum('total_ttc');

        // 6. Marge estimée (margin_estimated of accepted quotes)
        $estimatedMargin = Quote::where('status', 'Accepté')->sum('margin_estimated');

        // 7. Évolution mensuelle (3 derniers mois)
        $monthlyEvolution = [];
        for ($i = 2; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthlyTurnover = Invoice::where('status', '!=', 'Brouillon')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->sum('total_ht');
            
            $monthlyEvolution[] = [
                'month' => $date->translatedFormat('F Y') ?: $date->format('F Y'),
                'turnover' => (float) $monthlyTurnover,
            ];
        }

        $data = [
            'turnover_month' => $turnoverMonth,
            'quotes_sent' => [
                'count' => $quotesSentCount,
                'amount' => $quotesSentAmount,
            ],
            'quotes_won' => [
                'count' => $quotesWonCount,
                'amount' => $quotesWonAmount,
                'conversion_rate' => $conversionRate,
            ],
            'active_projects_count' => $activeProjectsCount,
            'unpaid_invoices' => [
                'count' => $unpaidInvoicesCount,
                'amount' => $unpaidInvoicesAmount,
            ],
            'estimated_margin' => $estimatedMargin,
            'monthly_evolution' => $monthlyEvolution,
        ];

        return new DirectorDashboardResource($data);
    }

    /**
     * Commercial Dashboard
     * Accessible by: commercial, super_admin
     */
    public function commercial(Request $request)
    {
        $userId = $request->user()->id;
        $now = Carbon::now();

        // 1. Leads nouveaux (7 derniers jours)
        $newLeadsCount = Lead::where('status', 'Nouveau')
            ->where('assigned_to', $userId)
            ->where('created_at', '>=', $now->copy()->subDays(7))
            ->count();

        // 2. Relances du jour (activities planned for today, status = Planifié)
        $todayFollowUpsCount = Activity::where('created_by', $userId)
            ->where('status', 'Planifié')
            ->whereDate('due_date', Carbon::today())
            ->count();

        // 3. Opportunités en cours (assigned to commercial, status not Gagnée / Perdue)
        $activeOppsCount = Opportunity::where('assigned_to', $userId)
            ->whereNotIn('status', ['Gagnée', 'Perdue'])
            ->count();
        $pipelineAmount = Opportunity::where('assigned_to', $userId)
            ->whereNotIn('status', ['Gagnée', 'Perdue'])
            ->sum('estimated_budget');

        // 4. Devis en attente de réponse (status = Envoyé, created by commercial)
        $pendingQuotesCount = Quote::where('created_by', $userId)
            ->where('status', 'Envoyé')
            ->count();

        // 5. Taux de conversion personnel (Quotes created by him: Accepté / not Brouillon)
        $wonQuotes = Quote::where('created_by', $userId)->where('status', 'Accepté')->count();
        $totalQuotes = Quote::where('created_by', $userId)->where('status', '!=', 'Brouillon')->count();
        $personalConversionRate = $totalQuotes > 0 ? ($wonQuotes / $totalQuotes) * 100 : 0;

        // 6. Prochains rendez-vous (upcoming activities not Complété)
        $upcomingMeetings = Activity::where('created_by', $userId)
            ->where('due_date', '>=', $now)
            ->where('status', '!=', 'Complété')
            ->orderBy('due_date', 'asc')
            ->take(5)
            ->get();

        $data = [
            'new_leads_count' => $newLeadsCount,
            'today_follow_ups_count' => $todayFollowUpsCount,
            'active_opportunities' => [
                'count' => $activeOppsCount,
                'pipeline_amount' => $pipelineAmount,
            ],
            'pending_quotes_count' => $pendingQuotesCount,
            'personal_conversion_rate' => $personalConversionRate,
            'upcoming_meetings' => $upcomingMeetings->toArray(),
        ];

        return new CommercialDashboardResource($data);
    }

    /**
     * Project Manager Dashboard
     * Accessible by: chef_chantier, super_admin
     */
    public function projectManager(Request $request)
    {
        $userId = $request->user()->id;
        $now = Carbon::now();

        // 1. Projets actifs dont il est responsable
        $activeProjects = Project::where('project_manager_id', $userId)
            ->whereIn('status', ['À commencer', 'En cours'])
            ->get();

        $projectIds = $activeProjects->pluck('id');

        // 2. Tâches en cours/en retard
        $inProgressCount = ProjectTask::whereIn('project_id', $projectIds)
            ->where('status', 'En cours')
            ->count();
        
        $lateCount = ProjectTask::whereIn('project_id', $projectIds)
            ->where('status', '!=', 'Terminé')
            ->whereNotNull('end_date')
            ->where('end_date', '<', Carbon::today())
            ->count();

        $totalCount = ProjectTask::whereIn('project_id', $projectIds)->count();

        // 3. Heures validées/en attente
        $validatedHours = WorkLog::whereIn('project_id', $projectIds)->sum('hours_worked');
        $pendingHours = 0; // Pointages no structure for pending, defaulted to 0

        // 4. Blocages signalés (tasks with status 'Bloqué')
        $reportedBlocksCount = ProjectTask::whereIn('project_id', $projectIds)
            ->where('status', 'Bloqué')
            ->count();

        // 5. Photos uploadées récemment
        $recentPhotos = ProjectPhoto::whereIn('project_id', $projectIds)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // 6. Prochaines échéances (tasks not Terminé ending soon)
        $upcomingDeadlines = ProjectTask::whereIn('project_id', $projectIds)
            ->where('status', '!=', 'Terminé')
            ->whereNotNull('end_date')
            ->where('end_date', '>=', Carbon::today())
            ->orderBy('end_date', 'asc')
            ->take(5)
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'end_date' => $task->end_date,
                    'project_name' => $task->project?->title,
                    'type' => 'task',
                ];
            });

        $data = [
            'active_projects' => $activeProjects->toArray(),
            'tasks_stats' => [
                'in_progress_count' => $inProgressCount,
                'late_count' => $lateCount,
                'total_count' => $totalCount,
            ],
            'hours_stats' => [
                'validated_hours' => $validatedHours,
                'pending_hours' => $pendingHours,
            ],
            'reported_blocks_count' => $reportedBlocksCount,
            'recent_photos' => $recentPhotos->toArray(),
            'upcoming_deadlines' => $upcomingDeadlines->toArray(),
        ];

        return new ProjectManagerDashboardResource($data);
    }

    /**
     * Finance Dashboard
     * Accessible by: finance, super_admin
     */
    public function finance()
    {
        $now = Carbon::now();

        // 1. Factures émises (mois en cours, status != Brouillon)
        $invoicesCount = Invoice::where('status', '!=', 'Brouillon')
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->count();
        $invoicesAmount = Invoice::where('status', '!=', 'Brouillon')
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->sum('total_ht');

        // 2. Paiements reçus (mois en cours, status = Encaissé)
        $paymentsAmount = Payment::where('status', 'Encaissé')
            ->whereMonth('payment_date', $now->month)
            ->whereYear('payment_date', $now->year)
            ->sum('amount');

        // 3. Impayés (liste + montant total) - status != Payée and status != Brouillon, and due_date < today
        $unpaidInvoices = Invoice::whereNotIn('status', ['Payée', 'Brouillon'])
            ->where('due_date', '<', Carbon::today())
            ->orderBy('due_date', 'asc')
            ->get();
        $unpaidTotalAmount = $unpaidInvoices->sum('total_ttc');

        // 4. Échéances à venir (7 prochains jours) - status != Payée and status != Brouillon, due_date between today and today+7
        $upcomingInvoices = Invoice::whereNotIn('status', ['Payée', 'Brouillon'])
            ->whereBetween('due_date', [Carbon::today(), Carbon::today()->addDays(7)])
            ->orderBy('due_date', 'asc')
            ->get();
        $upcomingTotalAmount = $upcomingInvoices->sum('total_ttc');

        // 5. Taux d'encaissement (total payments / total ttc invoices issued)
        $totalPayments = Payment::where('status', 'Encaissé')->sum('amount');
        $totalInvoicesIssued = Invoice::where('status', '!=', 'Brouillon')->sum('total_ttc');
        $collectionRate = $totalInvoicesIssued > 0 ? ($totalPayments / $totalInvoicesIssued) * 100 : 0;

        $data = [
            'invoices_issued' => [
                'count' => $invoicesCount,
                'amount' => $invoicesAmount,
            ],
            'payments_received_amount' => $paymentsAmount,
            'unpaid_invoices' => [
                'total_amount' => $unpaidTotalAmount,
                'list' => $unpaidInvoices->toArray(),
            ],
            'upcoming_due_dates' => [
                'total_amount' => $upcomingTotalAmount,
                'list' => $upcomingInvoices->toArray(),
            ],
            'collection_rate' => $collectionRate,
        ];

        return new FinanceDashboardResource($data);
    }
}
