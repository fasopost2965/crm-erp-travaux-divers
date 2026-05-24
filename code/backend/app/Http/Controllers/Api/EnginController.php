<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Engin;
use App\Models\EnginAffectation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EnginController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Engin::withCount('affectations');

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $engins = $query->orderBy('designation')->paginate(20);

        return response()->json([
            'data' => $engins->items(),
            'meta' => ['total' => $engins->total(), 'current_page' => $engins->currentPage(), 'last_page' => $engins->lastPage()],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'designation' => 'required|string|max:150',
            'type' => 'required|in:grue,pelleteuse,camion,compacteur,pompe_beton,echafaudage,autre',
            'marque' => 'nullable|string|max:80',
            'modele' => 'nullable|string|max:80',
            'immatriculation' => 'nullable|string|max:30',
            'annee_fabrication' => 'nullable|integer|min:1950|max:' . (date('Y') + 1),
            'taux_location_journalier' => 'nullable|numeric|min:0',
            'statut' => 'in:disponible,en_chantier,en_maintenance,retire',
            'prochaine_revision' => 'nullable|date',
            'observations' => 'nullable|string',
        ]);

        $data['code'] = 'ENG-' . str_pad(Engin::withTrashed()->count() + 1, 3, '0', STR_PAD_LEFT);

        $engin = Engin::create($data);
        return response()->json($engin, 201);
    }

    public function show(Engin $engin): JsonResponse
    {
        return response()->json($engin->load('affectations.project'));
    }

    public function update(Request $request, Engin $engin): JsonResponse
    {
        $data = $request->validate([
            'designation' => 'sometimes|string|max:150',
            'type' => 'sometimes|in:grue,pelleteuse,camion,compacteur,pompe_beton,echafaudage,autre',
            'marque' => 'nullable|string|max:80',
            'modele' => 'nullable|string|max:80',
            'immatriculation' => 'nullable|string|max:30',
            'taux_location_journalier' => 'nullable|numeric|min:0',
            'statut' => 'in:disponible,en_chantier,en_maintenance,retire',
            'prochaine_revision' => 'nullable|date',
            'compteur_heures' => 'nullable|integer|min:0',
            'observations' => 'nullable|string',
        ]);

        $engin->update($data);
        return response()->json($engin->fresh());
    }

    public function destroy(Engin $engin): JsonResponse
    {
        $engin->delete();
        return response()->json(null, 204);
    }

    public function affecter(Request $request, Engin $engin): JsonResponse
    {
        $data = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'observations' => 'nullable|string',
        ]);

        if ($data['date_debut'] && isset($data['date_fin'])) {
            $days = (int) now()->parse($data['date_debut'])->diffInDays($data['date_fin']) + 1;
            $data['nb_jours'] = $days;
            $data['cout_total'] = $days * ($engin->taux_location_journalier ?? 0);
        }

        $data['engin_id'] = $engin->id;
        $affectation = EnginAffectation::create($data);
        $engin->update(['statut' => 'en_chantier']);

        return response()->json($affectation->load('project'), 201);
    }
}
