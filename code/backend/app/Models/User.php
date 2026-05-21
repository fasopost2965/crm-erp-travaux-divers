<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relation avec le rôle de l'utilisateur.
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Relation avec les comptes gérés/créés par l'utilisateur.
     */
    public function ownedAccounts()
    {
        return $this->hasMany(Account::class, 'owner_id');
    }

    /**
     * Pistes commerciales affectées à l'utilisateur.
     */
    public function leads()
    {
        return $this->hasMany(Lead::class, 'assigned_to');
    }

    /**
     * Opportunités affectées à l'utilisateur.
     */
    public function opportunities()
    {
        return $this->hasMany(Opportunity::class, 'assigned_to');
    }

    /**
     * Équipe de chantiers / Participations projets.
     */
    public function teamMembers()
    {
        return $this->hasMany(ProjectTeamMember::class);
    }

    /**
     * Feuilles de temps saisies par l'utilisateur.
     */
    public function workLogs()
    {
        return $this->hasMany(WorkLog::class);
    }

    // Helpers rôles
    public function hasRole(string $slug): bool
    {
        return $this->role && $this->role->slug === $slug;
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isCommercial(): bool
    {
        return $this->hasRole('commercial');
    }

    public function isProjectManager(): bool
    {
        return $this->hasRole('chef_chantier') || $this->hasRole('chef_projet');
    }

    public function isWorker(): bool
    {
        return $this->hasRole('technicien') || $this->hasRole('ouvrier');
    }
}
