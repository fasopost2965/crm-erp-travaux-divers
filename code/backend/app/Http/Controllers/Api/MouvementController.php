<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mouvement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MouvementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Mouvement::with(['project', 'createdBy']);

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('categorie')) {
            $query->where('categorie', $request->categorie);
        }

        if ($request->filled('date_debut') && $request->filled('date_fin')) {
            $query->whereBetween('date_mouvement', [$request->date_debut, $request->date_fin]);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $mouvements = $query->orderBy('date_mouvement', 'desc')->paginate(25);

        $totaux = Mouvement::when($request->filled('project_id'), fn($q) => $q->where('project_id', $request->project_id))
            ->selectRaw('type, SUM(montant_ttc) as total')
            ->groupBy('type')
            ->get()
            ->keyBy('type');

        $encaissements = $totaux->get('encaissement')?->total ?? 0;
        $decaissements = $totaux->get('decaissement')?->total ?? 0;

        return response()->json([
            'data' => $mouvements->items(),
            'meta' => [
                'current_page' => $mouvements->currentPage(),
                'last_page' => $mouvements->lastPage(),
                'total' => $mouvements->total(),
            ],
            'solde' => [
                'encaissements' => round($encaissements, 2),
                'decaissements' => round($decaissements, 2),
                'solde_net' => round($encaissements - $decaissements, 2),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'invoice_id' => 'nullable|exists:invoices,id',
            'type' => 'required|in:encaissement,decaissement',
            'categorie' => 'required|in:reglement_client,acompte_client,achat_materiau,salaires,sous_traitant,location_engin,charges_fixes,impots_taxes,autre',
            'libelle' => 'required|string|max:200',
            'montant_ht' => 'required|numeric|min:0',
            'tva' => 'nullable|numeric|min:0|max:100',
            'date_mouvement' => 'required|date',
            'mode_paiement' => 'in:virement,cheque,especes,effet,autre',
            'statut' => 'in:prevu,realise,annule',
            'notes' => 'nullable|string',
        ]);

        $data['created_by'] = $request->user()->id;
        $tva = $data['tva'] ?? 0;
        $data['montant_ttc'] = $data['montant_ht'] * (1 + $tva / 100);
        $data['reference'] = 'MVT-' . now()->format('Ymd') . '-' . str_pad(Mouvement::whereDate('created_at', today())->count() + 1, 3, '0', STR_PAD_LEFT);

        $mouvement = Mouvement::create($data);

        return response()->json($mouvement->load('project', 'createdBy'), 201);
    }

    public function show(Mouvement $mouvement): JsonResponse
    {
        return response()->json($mouvement->load('project', 'invoice', 'createdBy'));
    }

    public function update(Request $request, Mouvement $mouvement): JsonResponse
    {
        $data = $request->validate([
            'libelle' => 'sometimes|string|max:200',
            'montant_ht' => 'sometimes|numeric|min:0',
            'tva' => 'nullable|numeric|min:0|max:100',
            'date_mouvement' => 'sometimes|date',
            'mode_paiement' => 'in:virement,cheque,especes,effet,autre',
            'statut' => 'in:prevu,realise,annule',
            'notes' => 'nullable|string',
        ]);

        if (isset($data['montant_ht'])) {
            $tva = $data['tva'] ?? $mouvement->tva;
            $data['montant_ttc'] = $data['montant_ht'] * (1 + $tva / 100);
        }

        $mouvement->update($data);
        return response()->json($mouvement->fresh()->load('project'));
    }

    public function destroy(Mouvement $mouvement): JsonResponse
    {
        $mouvement->delete();
        return response()->json(null, 204);
    }
}
