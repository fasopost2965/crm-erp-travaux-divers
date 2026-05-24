<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Engin extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code', 'designation', 'type', 'marque', 'modele', 'immatriculation',
        'annee_fabrication', 'taux_location_journalier', 'statut',
        'prochaine_revision', 'compteur_heures', 'observations',
    ];

    protected $casts = [
        'prochaine_revision' => 'date',
        'taux_location_journalier' => 'decimal:2',
    ];

    public function affectations()
    {
        return $this->hasMany(EnginAffectation::class);
    }

    public function projects()
    {
        return $this->belongsToMany(Project::class, 'engin_affectations')
            ->withPivot('date_debut', 'date_fin', 'nb_jours', 'cout_total')
            ->withTimestamps();
    }
}
