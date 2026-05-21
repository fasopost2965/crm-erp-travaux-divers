<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AccountController extends Controller
{
    /**
     * Liste tous les comptes clients.
     */
    public function index()
    {
        $accounts = Account::with('contacts')->latest()->paginate(10);
        return response()->json($accounts);
    }

    /**
     * Enregistre un nouveau compte client.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'ice' => 'nullable|string|size:15',
            'rc' => 'nullable|string|max:50',
            'patente' => 'nullable|string|max:50',
            'iff' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
        ]);

        $validated['created_by'] = auth()->id() ?? 1; // Fallback pour le seeder

        $account = Account::create($validated);

        return response()->json([
            'message' => 'Compte client créé avec succès',
            'account' => $account
        ], 201);
    }

    /**
     * Affiche un compte client spécifique.
     */
    public function show(Account $account)
    {
        $account->load(['contacts', 'quotes', 'projects']);
        return response()->json($account);
    }

    /**
     * Met à jour les informations d'un compte client.
     */
    public function update(Request $request, Account $account)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'ice' => 'nullable|string|size:15',
            'rc' => 'nullable|string|max:50',
            'patente' => 'nullable|string|max:50',
            'iff' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
        ]);

        $account->update($validated);

        return response()->json([
            'message' => 'Compte client mis à jour avec succès',
            'account' => $account
        ]);
    }

    /**
     * Supprime un compte client.
     */
    public function destroy(Account $account)
    {
        $account->delete();

        return response()->json([
            'message' => 'Compte client supprimé avec succès'
        ]);
    }
}
