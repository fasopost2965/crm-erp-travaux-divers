<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'quote_id',
        'account_id',
        'invoice_number',
        'title',
        'type',
        'situation_percentage',
        'status',
        'total_ht',
        'tva_rate',
        'total_ttc',
        'retention_amount',
        'due_date'
    ];

    /**
     * Client associé.
     */
    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Devis d'origine.
     */
    public function quote()
    {
        return $this->belongsTo(Quote::class);
    }

    /**
     * Lignes de factures.
     */
    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Paiements / Règlements reçus pour cette facture.
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Recalcule automatiquement les totaux globaux de la facture.
     */
    public function recalculateTotals(): void
    {
        $totalHt = $this->items()->sum('total_price_ht');
        $tvaRate = $this->tva_rate ?? 20.00;
        $totalTtc = $totalHt * (1 + ($tvaRate / 100));

        // Gestion de la retenue de garantie si définie sur le devis associé
        $retentionAmount = 0.00;
        if ($this->quote && $this->quote->retention_rate > 0) {
            $retentionAmount = $totalTtc * ($this->quote->retention_rate / 100);
        }

        $this->update([
            'total_ht' => $totalHt,
            'total_ttc' => $totalTtc - $retentionAmount,
            'retention_amount' => $retentionAmount,
        ]);
    }
}
