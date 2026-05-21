<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectTeamMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'user_id',
        'role_on_project'
    ];

    /**
     * Projet associé.
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Membre d'équipe (utilisateur interne).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
