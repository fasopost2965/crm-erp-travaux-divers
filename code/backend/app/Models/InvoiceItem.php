<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'description',
        'unit',
        'quantity',
        'unit_price_ht',
        'total_price_ht'
    ];

    protected static function booted()
    {
        static::saving(function (InvoiceItem $item) {
            $item->total_price_ht = $item->quantity * $item->unit_price_ht;
        });

        static::saved(function (InvoiceItem $item) {
            $item->invoice->recalculateTotals();
        });

        static::deleted(function (InvoiceItem $item) {
            $item->invoice->recalculateTotals();
        });
    }

    /**
     * Facture parente.
     */
    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
