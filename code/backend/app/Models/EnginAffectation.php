<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EnginAffectation extends Model
{
    use HasFactory;

    protected $table = 'engin_affectations';

    protected $fillable = [
        'engin_id', 'project_id', 'date_debut', 'date_fin',
        'nb_jours', 'cout_total', 'observations',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'nb_jours' => 'decimal:2',
        'cout_total' => 'decimal:2',
    ];

    public function engin()
    {
        return $this->belongsTo(Engin::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
