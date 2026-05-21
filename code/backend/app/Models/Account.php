<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Account extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'ice',
        'rc',
        'patente',
        'iff',
        'email',
        'phone',
        'address',
        'city',
        'owner_id'
    ];

    /**
     * Interlocuteurs physiques chez ce client.
     */
    public function contacts()
    {
        return $this->hasMany(Contact::class);
    }

    /**
     * Pistes commerciales d'origines.
     */
    public function leads()
    {
        return $this->hasMany(Lead::class, 'account_name', 'name');
    }

    /**
     * Opportunités commerciales qualifiées.
     */
    public function opportunities()
    {
        return $this->hasMany(Opportunity::class);
    }

    /**
     * Devis chiffrés.
     */
    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }

    /**
     * Factures de ce client.
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Chantiers associés à ce client.
     */
    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Propriétaire/Créateur du compte client.
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Notes associées au compte client.
     */
    public function notes()
    {
        return $this->morphMany(Note::class, 'notable');
    }

    /**
     * Activités associées au compte client.
     */
    public function activities()
    {
        return $this->morphMany(Activity::class, 'activitable');
    }

    /**
     * Documents associés au compte client.
     */
    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    /**
     * Tags associés au compte client.
     */
    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
