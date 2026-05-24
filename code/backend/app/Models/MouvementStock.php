<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MouvementStock extends Model
{
    use HasFactory;

    protected $table = 'mouvements_stock';

    protected $fillable = [
        'article_id', 'project_id', 'bon_commande_id',
        'type', 'quantite', 'prix_unitaire', 'date_mouvement', 'motif',
    ];

    protected $casts = [
        'date_mouvement' => 'date',
        'quantite' => 'decimal:3',
        'prix_unitaire' => 'decimal:2',
    ];

    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function bonCommande()
    {
        return $this->belongsTo(BonCommande::class);
    }
}
