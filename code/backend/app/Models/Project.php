<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'quote_id',
        'account_id',
        'title',
        'description',
        'address',
        'city',
        'status',
        'budget',
        'start_date',
        'end_date_planned',
        'end_date_actual',
        'project_manager_id'
    ];

    /**
     * Client / Compte lié.
     */
    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Devis accepté d'origine.
     */
    public function quote()
    {
        return $this->belongsTo(Quote::class);
    }

    /**
     * Conducteur de travaux / Chef de projet interne.
     */
    public function manager()
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    /**
     * Tâches du chantier.
     */
    public function tasks()
    {
        return $this->hasMany(ProjectTask::class);
    }

    /**
     * Membres de l'équipe affectés à ce projet/chantier.
     */
    public function teamMembers()
    {
        return $this->hasMany(ProjectTeamMember::class);
    }

    /**
     * Heures de travail déclarées sur ce projet.
     */
    public function workLogs()
    {
        return $this->hasMany(WorkLog::class);
    }

    /**
     * Photos d'avancement du chantier.
     */
    public function photos()
    {
        return $this->hasMany(ProjectPhoto::class);
    }

    /**
     * Documents techniques et administratifs.
     */
    public function documents()
    {
        return $this->hasMany(ProjectDocument::class);
    }

    /**
     * Signatures et réceptions de PV de chantier.
     */
    public function signatures()
    {
        return $this->hasMany(ProjectSignature::class);
    }
}
