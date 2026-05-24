<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mouvement extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'project_id', 'invoice_id', 'created_by', 'reference', 'type',
        'categorie', 'libelle', 'montant_ht', 'tva', 'montant_ttc',
        'date_mouvement', 'mode_paiement', 'piece_jointe', 'statut', 'notes',
    ];

    protected $casts = [
        'date_mouvement' => 'date',
        'montant_ht' => 'decimal:2',
        'montant_ttc' => 'decimal:2',
        'tva' => 'decimal:2',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
