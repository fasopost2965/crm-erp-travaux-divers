<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'color'
    ];

    /**
     * Interlocuteurs Comptes associés à ce tag.
     */
    public function accounts()
    {
        return $this->morphedByMany(Account::class, 'taggable');
    }

    /**
     * Pistes Leads associées à ce tag.
     */
    public function leads()
    {
        return $this->morphedByMany(Lead::class, 'taggable');
    }

    /**
     * Opportunités associées à ce tag.
     */
    public function opportunities()
    {
        return $this->morphedByMany(Opportunity::class, 'taggable');
    }
}
