<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quote extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'opportunity_id',
        'account_id',
        'quote_number',
        'title',
        'status',
        'total_ht',
        'tva_rate',
        'total_ttc',
        'margin_estimated',
        'retention_rate',
        'valid_until',
        'created_by'
    ];

    /**
     * Compte client associé.
     */
    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Opportunité associée.
     */
    public function opportunity()
    {
        return $this->belongsTo(Opportunity::class);
    }

    /**
     * Lignes du devis.
     */
    public function items()
    {
        return $this->hasMany(QuoteItem::class);
    }

    /**
     * Factures générées depuis ce devis.
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Chantier relié à ce devis.
     */
    public function project()
    {
        return $this->hasOne(Project::class);
    }

    /**
     * Utilisateur interne qui a généré le devis.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Recalcule automatiquement les totaux du devis en fonction de ses lignes.
     */
    public function recalculateTotals(): void
    {
        $totalHt = $this->items()->sum('total_price_ht');
        $tvaRate = $this->tva_rate ?? 20.00;
        $totalTtc = $totalHt * (1 + ($tvaRate / 100));

        $this->update([
            'total_ht' => $totalHt,
            'total_ttc' => $totalTtc,
        ]);
    }
}
