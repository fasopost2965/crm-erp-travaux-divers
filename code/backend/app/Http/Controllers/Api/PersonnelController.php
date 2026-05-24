<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Personnel;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PersonnelController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Personnel::query();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('nom', 'like', "%{$s}%")
                  ->orWhere('prenom', 'like', "%{$s}%")
                  ->orWhere('matricule', 'like', "%{$s}%")
                  ->orWhere('cin', 'like', "%{$s}%");
            });
        }

        if ($request->filled('type_contrat')) {
            $query->where('type_contrat', $request->type_contrat);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $personnels = $query->orderBy('nom')->paginate(20);

        return response()->json([
            'data' => $personnels->items(),
            'meta' => [
                'current_page' => $personnels->currentPage(),
                'last_page' => $personnels->lastPage(),
                'total' => $personnels->total(),
                'per_page' => $personnels->perPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'cin' => 'nullable|string|max:20|unique:personnels,cin',
            'telephone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'type_contrat' => 'required|in:CDI,CDD,journalier,sous_traitant',
            'poste' => 'nullable|string|max:100',
            'specialite' => 'nullable|string|max:100',
            'taux_journalier' => 'nullable|numeric|min:0',
            'salaire_base' => 'nullable|numeric|min:0',
            'numero_cnss' => 'nullable|string|max:30',
            'date_embauche' => 'nullable|date',
            'date_fin_contrat' => 'nullable|date|after_or_equal:date_embauche',
            'statut' => 'in:actif,inactif,conge,suspendu',
            'rib_bancaire' => 'nullable|string|max:30',
            'banque' => 'nullable|string|max:80',
            'notes' => 'nullable|string',
        ]);

        $data['matricule'] = 'EMP-' . str_pad(Personnel::withTrashed()->count() + 1, 4, '0', STR_PAD_LEFT);

        $personnel = Personnel::create($data);

        return response()->json($personnel, 201);
    }

    public function show(Personnel $personnel): JsonResponse
    {
        return response()->json($personnel->load('pointages.project'));
    }

    public function update(Request $request, Personnel $personnel): JsonResponse
    {
        $data = $request->validate([
            'nom' => 'sometimes|required|string|max:100',
            'prenom' => 'sometimes|required|string|max:100',
            'cin' => "nullable|string|max:20|unique:personnels,cin,{$personnel->id}",
            'telephone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'type_contrat' => 'sometimes|required|in:CDI,CDD,journalier,sous_traitant',
            'poste' => 'nullable|string|max:100',
            'specialite' => 'nullable|string|max:100',
            'taux_journalier' => 'nullable|numeric|min:0',
            'salaire_base' => 'nullable|numeric|min:0',
            'numero_cnss' => 'nullable|string|max:30',
            'date_embauche' => 'nullable|date',
            'date_fin_contrat' => 'nullable|date',
            'statut' => 'in:actif,inactif,conge,suspendu',
            'rib_bancaire' => 'nullable|string|max:30',
            'banque' => 'nullable|string|max:80',
            'notes' => 'nullable|string',
        ]);

        $personnel->update($data);

        return response()->json($personnel->fresh());
    }

    public function destroy(Personnel $personnel): JsonResponse
    {
        $personnel->delete();
        return response()->json(null, 204);
    }
}
