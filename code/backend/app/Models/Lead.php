<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'account_name',
        'contact_name',
        'email',
        'phone',
        'source',
        'status',
        'assigned_to',
        'notes'
    ];

    /**
     * Commercial ou administrateur affecté au lead.
     */
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Opportunité générée suite à la qualification du lead.
     */
    public function opportunity()
    {
        return $this->hasOne(Opportunity::class);
    }

    /**
     * Notes associées au Lead.
     */
    public function notes()
    {
        return $this->morphMany(Note::class, 'notable');
    }

    /**
     * Activités associées au Lead.
     */
    public function activities()
    {
        return $this->morphMany(Activity::class, 'activitable');
    }

    /**
     * Documents associés au Lead.
     */
    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    /**
     * Tags associés au Lead.
     */
    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
