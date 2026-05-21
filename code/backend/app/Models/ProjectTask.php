<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjectTask extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'status',
        'priority',
        'start_date',
        'end_date',
        'assigned_to'
    ];

    /**
     * Chantier parent.
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Utilisateur interne (ouvrier ou technicien) assigné à la tâche.
     */
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Saisies de temps de travail sur cette tâche.
     */
    public function workLogs()
    {
        return $this->hasMany(WorkLog::class);
    }
}
