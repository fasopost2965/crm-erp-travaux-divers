<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProjectPolicy
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
     * Voir la liste des chantiers.
     */
    public function viewAny(User $user): bool
    {
        // Les admins, commerciaux et chefs de projet peuvent voir la liste des chantiers
        return $user->isCommercial() || $user->isProjectManager() || $user->isWorker();
    }

    /**
     * Voir les détails d'un chantier.
     */
    public function view(User $user, Project $project): bool
    {
        if ($user->isCommercial()) {
            return true;
        }

        if ($user->isProjectManager()) {
            // Le chef de projet doit être celui assigné au chantier
            return $project->project_manager_id === $user->id;
        }

        if ($user->isWorker()) {
            // Un ouvrier peut voir le chantier s'il possède des tâches qui lui sont assignées sur ce chantier
            return $project->tasks()->where('assigned_to', $user->id)->exists();
        }

        return false;
    }

    /**
     * Créer un chantier.
     */
    public function create(User $user): bool
    {
        // Les commerciaux créent des chantiers lorsqu'un devis est accepté
        return $user->isCommercial();
    }

    /**
     * Modifier les détails d'un chantier.
     */
    public function update(User $user, Project $project): bool
    {
        // Le chef de projet assigné ou le commercial peut modifier le chantier
        return $user->isCommercial() || ($user->isProjectManager() && $project->project_manager_id === $user->id);
    }

    /**
     * Supprimer un chantier.
     */
    public function delete(User $user, Project $project): bool
    {
        // Seuls les admins peuvent supprimer un chantier entier
        return false;
    }
}
