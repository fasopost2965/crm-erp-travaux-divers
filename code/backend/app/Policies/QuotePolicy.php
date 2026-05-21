<?php

namespace App\Policies;

use App\Models\Quote;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class QuotePolicy
{
    /**
     * L'administrateur a toujours un accès complet.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    /**
     * Détermine si l'utilisateur peut voir la liste des devis.
     */
    public function viewAny(User $user): bool
    {
        return $user->isCommercial() || $user->isProjectManager();
    }

    /**
     * Détermine si l'utilisateur peut voir un devis spécifique.
     */
    public function view(User $user, Quote $quote): bool
    {
        if ($user->isCommercial()) {
            return true; // Le commercial peut tout voir
        }

        if ($user->isProjectManager()) {
            // Le chef de projet peut voir le devis uniquement s'il gère le chantier lié
            return $quote->project && $quote->project->project_manager_id === $user->id;
        }

        return false;
    }

    /**
     * Détermine si l'utilisateur peut créer un devis.
     */
    public function create(User $user): bool
    {
        return $user->isCommercial();
    }

    /**
     * Détermine si l'utilisateur peut modifier un devis.
     */
    public function update(User $user, Quote $quote): bool
    {
        // Seul le commercial peut modifier ses devis et seulement s'il est au statut Brouillon ou Envoyé
        return $user->isCommercial() && in_array($quote->status, ['Brouillon', 'Envoyé']);
    }

    /**
     * Détermine si l'utilisateur peut supprimer un devis.
     */
    public function delete(User $user, Quote $quote): bool
    {
        // Seul le commercial ou l'admin peut supprimer un devis en brouillon
        return $user->isCommercial() && $quote->status === 'Brouillon';
    }
}
