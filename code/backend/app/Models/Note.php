<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Note extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'content',
        'notable_type',
        'notable_id',
        'created_by'
    ];

    /**
     * Modèle parent associé à la note (Account, Lead, Opportunity, etc.).
     */
    public function notable()
    {
        return $this->morphTo();
    }

    /**
     * Relation avec l'utilisateur qui a créé la note.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
