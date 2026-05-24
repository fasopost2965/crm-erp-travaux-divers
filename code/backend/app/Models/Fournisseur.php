<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Fournisseur extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code', 'raison_sociale', 'ice', 'telephone', 'email',
        'ville', 'categorie', 'statut',
    ];

    public function bonsCommande()
    {
        return $this->hasMany(BonCommande::class);
    }
}
