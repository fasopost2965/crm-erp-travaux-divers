<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectSignature extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'signed_by',
        'client_name',
        'signature_data',
        'signed_at'
    ];

    protected $casts = [
        'signed_at' => 'datetime'
    ];

    /**
     * Projet associé.
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Utilisateur interne ayant signé / validé.
     */
    public function signer()
    {
        return $this->belongsTo(User::class, 'signed_by');
    }
}
