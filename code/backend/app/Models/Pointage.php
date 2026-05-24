<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pointage extends Model
{
    use HasFactory;

    protected $fillable = [
        'personnel_id', 'project_id', 'validated_by', 'date_pointage',
        'presence', 'heures_normales', 'heures_supplementaires',
        'heure_arrivee', 'heure_depart', 'taux_journalier_applique',
        'montant_jour', 'est_valide', 'observations',
    ];

    protected $casts = [
        'date_pointage' => 'date',
        'heures_normales' => 'decimal:2',
        'heures_supplementaires' => 'decimal:2',
        'taux_journalier_applique' => 'decimal:2',
        'montant_jour' => 'decimal:2',
        'est_valide' => 'boolean',
    ];

    public function personnel()
    {
        return $this->belongsTo(Personnel::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function validatedBy()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }
}
