<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Models\QuoteItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class QuoteController extends Controller
{
    /**
     * Liste tous les devis.
     */
    public function index()
    {
        $quotes = Quote::with('account')->latest()->paginate(10);
        return response()->json($quotes);
    }

    /**
     * Crée un nouveau devis.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'opportunity_id' => 'nullable|exists:opportunities,id',
            'account_id' => 'required|exists:accounts,id',
            'title' => 'required|string|max:255',
            'quote_number' => 'required|string|unique:quotes,quote_number',
            'tva_rate' => 'nullable|numeric|min:0',
            'retention_rate' => 'nullable|numeric|min:0|max:100',
            'valid_until' => 'nullable|date',
        ]);

        $validated['status'] = 'Brouillon';
        $validated['created_by'] = auth()->id() ?? 1;

        $quote = Quote::create($validated);

        return response()->json([
            'message' => 'Devis créé sous forme de brouillon',
            'quote' => $quote
        ], 201);
    }

    /**
     * Affiche un devis spécifique.
     */
    public function show(Quote $quote)
    {
        $quote->load(['account', 'opportunity', 'items']);
        return response()->json($quote);
    }

    /**
     * Met à jour un devis.
     */
    public function update(Request $request, Quote $quote)
    {
        // Enregistrer la validation avec le Policy (Optionnel dans ce controlleur REST)
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|string|in:Brouillon,Envoyé,Accepté,Refusé,Expiré',
            'tva_rate' => 'nullable|numeric|min:0',
            'retention_rate' => 'nullable|numeric|min:0|max:100',
            'valid_until' => 'nullable|date',
        ]);

        $quote->update($validated);
        $quote->recalculateTotals();

        return response()->json([
            'message' => 'Devis mis à jour',
            'quote' => $quote->fresh()
        ]);
    }

    /**
     * Ajoute une ligne de prestation dans le devis.
     */
    public function addItem(Request $request, Quote $quote)
    {
        $validated = $request->validate([
            'section' => 'nullable|string|max:255',
            'description' => 'required|string',
            'unit' => 'required|string|max:10',
            'quantity' => 'required|numeric|min:0.01',
            'unit_price_ht' => 'required|numeric|min:0',
        ]);

        $item = $quote->items()->create($validated);
        $quote->recalculateTotals();

        return response()->json([
            'message' => 'Ligne de devis ajoutée',
            'item' => $item,
            'quote' => $quote->fresh()
        ], 201);
    }

    /**
     * Supprime un devis.
     */
    public function destroy(Quote $quote)
    {
        $quote->delete();

        return response()->json([
            'message' => 'Devis supprimé'
        ]);
    }
}
