<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Personnel extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'matricule', 'nom', 'prenom', 'cin', 'telephone', 'email',
        'type_contrat', 'poste', 'specialite', 'taux_journalier', 'salaire_base',
        'numero_cnss', 'date_embauche', 'date_fin_contrat', 'statut',
        'rib_bancaire', 'banque', 'notes',
    ];

    protected $casts = [
        'date_embauche' => 'date',
        'date_fin_contrat' => 'date',
        'taux_journalier' => 'decimal:2',
        'salaire_base' => 'decimal:2',
    ];

    public function pointages()
    {
        return $this->hasMany(Pointage::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->prenom} {$this->nom}";
    }
}
