<?php

namespace App\Policies;

use App\Models\ProjectTask;
use App\Models\User;

class ProjectTaskPolicy
{
    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }
        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('directeur') || $user->hasRole('chef_chantier') || $user->hasRole('technicien');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ProjectTask $projectTask): bool
    {
        return $user->hasRole('admin') || $user->hasRole('directeur') || $user->hasRole('chef_chantier') || $user->hasRole('technicien');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('directeur') || $user->hasRole('chef_chantier');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ProjectTask $projectTask): bool
    {
        return $user->hasRole('admin') || $user->hasRole('directeur') || $user->hasRole('chef_chantier');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ProjectTask $projectTask): bool
    {
        return $user->hasRole('admin') || $user->hasRole('chef_chantier');
    }
}
