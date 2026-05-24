<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pointage;
use App\Models\Personnel;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PointageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Pointage::with(['personnel', 'project']);

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('date')) {
            $query->whereDate('date_pointage', $request->date);
        }

        if ($request->filled('date_debut') && $request->filled('date_fin')) {
            $query->whereBetween('date_pointage', [$request->date_debut, $request->date_fin]);
        }

        if ($request->filled('personnel_id')) {
            $query->where('personnel_id', $request->personnel_id);
        }

        $pointages = $query->orderBy('date_pointage', 'desc')->paginate(50);

        $stats = null;
        if ($request->filled('project_id') && $request->filled('date')) {
            $dayPointages = Pointage::where('project_id', $request->project_id)
                ->whereDate('date_pointage', $request->date)
                ->get();

            $stats = [
                'total_presents' => $dayPointages->whereIn('presence', ['present', 'demi_journee'])->count(),
                'total_absents' => $dayPointages->where('presence', 'absent')->count(),
                'heures_normales' => $dayPointages->sum('heures_normales'),
                'heures_sup' => $dayPointages->sum('heures_supplementaires'),
                'masse_salariale' => $dayPointages->sum('montant_jour'),
            ];
        }

        return response()->json([
            'data' => $pointages->items(),
            'meta' => [
                'current_page' => $pointages->currentPage(),
                'last_page' => $pointages->lastPage(),
                'total' => $pointages->total(),
            ],
            'stats' => $stats,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'personnel_id' => 'required|exists:personnels,id',
            'project_id' => 'required|exists:projects,id',
            'date_pointage' => 'required|date',
            'presence' => 'required|in:present,absent,demi_journee,conge,maladie',
            'heures_normales' => 'nullable|numeric|min:0|max:24',
            'heures_supplementaires' => 'nullable|numeric|min:0|max:12',
            'heure_arrivee' => 'nullable|date_format:H:i',
            'heure_depart' => 'nullable|date_format:H:i',
            'observations' => 'nullable|string',
        ]);

        $personnel = Personnel::findOrFail($data['personnel_id']);
        $data['taux_journalier_applique'] = $personnel->taux_journalier;
        $data['montant_jour'] = $data['presence'] === 'absent'
            ? 0
            : ($data['presence'] === 'demi_journee'
                ? ($personnel->taux_journalier / 2)
                : $personnel->taux_journalier);

        $pointage = Pointage::updateOrCreate(
            ['personnel_id' => $data['personnel_id'], 'project_id' => $data['project_id'], 'date_pointage' => $data['date_pointage']],
            $data
        );

        return response()->json($pointage->load('personnel'), 201);
    }

    public function update(Request $request, Pointage $pointage): JsonResponse
    {
        $data = $request->validate([
            'presence' => 'sometimes|in:present,absent,demi_journee,conge,maladie',
            'heures_normales' => 'nullable|numeric|min:0|max:24',
            'heures_supplementaires' => 'nullable|numeric|min:0|max:12',
            'observations' => 'nullable|string',
            'est_valide' => 'boolean',
        ]);

        $pointage->update($data);
        return response()->json($pointage->load('personnel'));
    }

    public function validerJournee(Request $request): JsonResponse
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'date_pointage' => 'required|date',
        ]);

        $updated = Pointage::where('project_id', $request->project_id)
            ->whereDate('date_pointage', $request->date_pointage)
            ->update(['est_valide' => true, 'validated_by' => $request->user()->id]);

        return response()->json(['message' => "Journée validée — {$updated} pointages mis à jour."]);
    }

    public function destroy(Pointage $pointage): JsonResponse
    {
        $pointage->delete();
        return response()->json(null, 204);
    }
}
