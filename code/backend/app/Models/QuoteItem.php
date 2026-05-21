<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuoteItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'quote_id',
        'section',
        'description',
        'unit',
        'quantity',
        'unit_price_ht',
        'total_price_ht'
    ];

    protected static function booted()
    {
        // Calcul automatique du total de la ligne avant d'enregistrer
        static::saving(function (QuoteItem $item) {
            $item->total_price_ht = $item->quantity * $item->unit_price_ht;
        });

        // Recalculer les totaux globaux du devis après modification d'une ligne
        static::saved(function (QuoteItem $item) {
            $item->quote->recalculateTotals();
        });

        static::deleted(function (QuoteItem $item) {
            $item->quote->recalculateTotals();
        });
    }

    /**
     * Devis parent.
     */
    public function quote()
    {
        return $this->belongsTo(Quote::class);
    }
}
