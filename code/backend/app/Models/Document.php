<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'file_path',
        'documentable_type',
        'documentable_id',
        'uploaded_by'
    ];

    /**
     * Modèle parent associé au document.
     */
    public function documentable()
    {
        return $this->morphTo();
    }

    /**
     * Relation avec l'utilisateur qui a téléchargé le document.
     */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
