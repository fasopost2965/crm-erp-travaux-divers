<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Activity extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'type',
        'subject',
        'description',
        'due_date',
        'status',
        'activitable_type',
        'activitable_id',
        'created_by'
    ];

    protected $casts = [
        'due_date' => 'datetime'
    ];

    /**
     * Modèle parent associé à l'activité (Account, Lead, Opportunity, etc.).
     */
    public function activitable()
    {
        return $this->morphTo();
    }

    /**
     * Relation avec l'utilisateur qui a créé l'activité.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
