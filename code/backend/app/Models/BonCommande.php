<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BonCommande extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'bons_commande';

    protected $fillable = [
        'numero', 'fournisseur_id', 'project_id', 'created_by',
        'date_commande', 'date_livraison_prevue', 'date_livraison_reelle',
        'statut', 'montant_ht', 'tva', 'montant_ttc', 'notes',
    ];

    protected $casts = [
        'date_commande' => 'date',
        'date_livraison_prevue' => 'date',
        'date_livraison_reelle' => 'date',
        'montant_ht' => 'decimal:2',
        'montant_ttc' => 'decimal:2',
        'tva' => 'decimal:2',
    ];

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(BonCommandeItem::class);
    }
}
