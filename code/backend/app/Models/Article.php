<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Article extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code', 'designation', 'unite', 'categorie',
        'prix_unitaire', 'stock_actuel', 'stock_min', 'emplacement',
    ];

    protected $casts = [
        'prix_unitaire' => 'decimal:2',
        'stock_actuel' => 'decimal:3',
        'stock_min' => 'decimal:3',
    ];

    public function mouvementsStock()
    {
        return $this->hasMany(MouvementStock::class);
    }

    public function getIsEnRuptureAttribute(): bool
    {
        return $this->stock_actuel <= $this->stock_min;
    }
}
