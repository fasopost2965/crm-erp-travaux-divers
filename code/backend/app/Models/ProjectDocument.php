<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjectDocument extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'project_id',
        'title',
        'file_path',
        'type',
        'uploaded_by'
    ];

    /**
     * Chantier associé.
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Utilisateur interne ayant téléversé le document.
     */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
