<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Quote;
use App\Models\WorkLog;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function overview(): JsonResponse
    {
        $now = Carbon::now();

        $totalRevenue = Invoice::where('status', '!=', 'Brouillon')->sum('total_ht');
        $totalCollected = Payment::where('status', 'Encaissé')->sum('amount');
        $activeProjects = Project::whereIn('status', ['À commencer', 'En cours'])->count();
        $totalEmployees = Employee::where('status', 'Actif')->count();
        $totalHoursMonth = WorkLog::whereMonth('work_date', $now->month)
            ->whereYear('work_date', $now->year)
            ->sum('hours_worked');
        $pendingQuotes = Quote::where('status', 'Envoyé')->count();
        $pendingQuotesAmount = Quote::where('status', 'Envoyé')->sum('total_ht');
        $wonRate = Quote::where('status', '!=', 'Brouillon')->count() > 0
            ? Quote::where('status', 'Accepté')->count() / Quote::where('status', '!=', 'Brouillon')->count() * 100
            : 0;

        return response()->json([
            'totalRevenue'      => (float) $totalRevenue,
            'totalCollected'    => (float) $totalCollected,
            'activeProjects'    => $activeProjects,
            'totalEmployees'    => $totalEmployees,
            'totalHoursMonth'   => (float) $totalHoursMonth,
            'pendingQuotes'     => $pendingQuotes,
            'pendingQuotesAmount' => (float) $pendingQuotesAmount,
            'wonRate'           => round($wonRate, 1),
        ]);
    }

    public function revenue(): JsonResponse
    {
        $months = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $invoiced = Invoice::where('status', '!=', 'Brouillon')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->sum('total_ht');
            $collected = Payment::where('status', 'Encaissé')
                ->whereMonth('payment_date', $date->month)
                ->whereYear('payment_date', $date->year)
                ->sum('amount');
            $months[] = [
                'month'     => $date->format('M Y'),
                'invoiced'  => (float) $invoiced,
                'collected' => (float) $collected,
            ];
        }
        return response()->json($months);
    }

    public function projectsBreakdown(): JsonResponse
    {
        $statuses = ['À commencer', 'En cours', 'En pause', 'Terminé', 'Annulé'];
        $breakdown = [];
        foreach ($statuses as $status) {
            $count = Project::where('status', $status)->count();
            $budget = Project::where('status', $status)->sum('budget');
            if ($count > 0) {
                $breakdown[] = [
                    'status' => $status,
                    'count'  => $count,
                    'budget' => (float) $budget,
                ];
            }
        }

        $topProjects = Project::withCount('tasks')
            ->with('workLogs')
            ->whereIn('status', ['En cours', 'Terminé'])
            ->orderByDesc('budget')
            ->take(8)
            ->get()
            ->map(function ($p) {
                $hoursWorked = $p->workLogs->sum('hours_worked');
                return [
                    'id'           => $p->id,
                    'title'        => $p->title,
                    'status'       => $p->status,
                    'budget'       => (float) ($p->budget ?? 0),
                    'tasksCount'   => $p->tasks_count,
                    'hoursWorked'  => (float) $hoursWorked,
                ];
            });

        return response()->json([
            'statusBreakdown' => $breakdown,
            'topProjects'     => $topProjects,
        ]);
    }

    public function teamHours(): JsonResponse
    {
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $hours = WorkLog::whereMonth('work_date', $date->month)
                ->whereYear('work_date', $date->year)
                ->sum('hours_worked');
            $months[] = [
                'month' => $date->format('M Y'),
                'hours' => (float) $hours,
            ];
        }

        $byDepartment = Employee::where('status', 'Actif')
            ->whereNotNull('department')
            ->get()
            ->groupBy('department')
            ->map(fn($group) => $group->count())
            ->map(fn($count, $dept) => ['department' => $dept, 'count' => $count])
            ->values();

        return response()->json([
            'monthlyHours'  => $months,
            'byDepartment'  => $byDepartment,
            'totalEmployees' => Employee::where('status', 'Actif')->count(),
            'totalHours'    => (float) WorkLog::sum('hours_worked'),
        ]);
    }
}
