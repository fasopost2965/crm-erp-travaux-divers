<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'project_task_id',
        'user_id',
        'work_date',
        'hours_worked',
        'description'
    ];

    /**
     * Chantier concerné.
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Tâche de chantier associée (optionnel).
     */
    public function task()
    {
        return $this->belongsTo(ProjectTask::class, 'project_task_id');
    }

    /**
     * Ouvrier concerné.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
