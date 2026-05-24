<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BonCommandeItem extends Model
{
    use HasFactory;

    protected $table = 'bon_commande_items';

    protected $fillable = [
        'bon_commande_id', 'article_id', 'quantite', 'prix_unitaire',
        'montant_ht', 'quantite_recue',
    ];

    protected $casts = [
        'quantite' => 'decimal:3',
        'prix_unitaire' => 'decimal:2',
        'montant_ht' => 'decimal:2',
        'quantite_recue' => 'decimal:3',
    ];

    public function bonCommande()
    {
        return $this->belongsTo(BonCommande::class);
    }

    public function article()
    {
        return $this->belongsTo(Article::class);
    }
}
