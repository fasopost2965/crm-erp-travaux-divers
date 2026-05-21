<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contact extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'account_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'position'
    ];

    /**
     * Compte client associé.
     */
    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Nom complet du contact.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
