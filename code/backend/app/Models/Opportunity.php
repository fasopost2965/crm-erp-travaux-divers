<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Opportunity extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'account_id',
        'lead_id',
        'title',
        'estimated_budget',
        'probability',
        'status',
        'close_date',
        'assigned_to'
    ];

    /**
     * Compte client lié.
     */
    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Lead d'origine.
     */
    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Commercial affecté.
     */
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Devis chiffrés pour cette affaire.
     */
    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }

    /**
     * Notes associées à l'opportunité.
     */
    public function notes()
    {
        return $this->morphMany(Note::class, 'notable');
    }

    /**
     * Activités associées à l'opportunité.
     */
    public function activities()
    {
        return $this->morphMany(Activity::class, 'activitable');
    }

    /**
     * Documents associés à l'opportunité.
     */
    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    /**
     * Tags associés à l'opportunité.
     */
    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
