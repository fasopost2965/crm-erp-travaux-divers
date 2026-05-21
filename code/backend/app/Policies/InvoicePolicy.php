<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class InvoicePolicy
{
    /**
     * L'administrateur a accès complet.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    /**
     * Voir la liste des factures.
     */
    public function viewAny(User $user): bool
    {
        return $user->isCommercial();
    }

    /**
     * Voir les détails d'une facture.
     */
    public function view(User $user, Invoice $invoice): bool
    {
        return $user->isCommercial();
    }

    /**
     * Créer une facture.
     */
    public function create(User $user): bool
    {
        return $user->isCommercial();
    }

    /**
     * Modifier une facture.
     */
    public function update(User $user, Invoice $invoice): bool
    {
        // Seule une facture au statut Brouillon peut être modifiée par le commercial
        return $user->isCommercial() && $invoice->status === 'Brouillon';
    }

    /**
     * Supprimer une facture.
     */
    public function delete(User $user, Invoice $invoice): bool
    {
        return false; // Seul l'administrateur peut supprimer
    }
}
