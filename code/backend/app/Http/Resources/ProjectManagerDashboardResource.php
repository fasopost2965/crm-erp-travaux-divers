<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectManagerDashboardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'activeProjects' => array_map(function ($project) {
                return [
                    'id' => $project['id'],
                    'title' => $project['title'],
                    'status' => $project['status'],
                    'budget' => (float) $project['budget'],
                    'startDate' => $project['start_date'],
                    'endDatePlanned' => $project['end_date_planned'],
                ];
            }, $this->resource['active_projects'] ?? []),
            'tasksStats' => [
                'inProgressCount' => (int) ($this->resource['tasks_stats']['in_progress_count'] ?? 0),
                'lateCount' => (int) ($this->resource['tasks_stats']['late_count'] ?? 0),
                'totalCount' => (int) ($this->resource['tasks_stats']['total_count'] ?? 0),
            ],
            'hoursStats' => [
                'validatedHours' => (float) ($this->resource['hours_stats']['validated_hours'] ?? 0),
                'pendingHours' => (float) ($this->resource['hours_stats']['pending_hours'] ?? 0),
            ],
            'reportedBlocksCount' => (int) ($this->resource['reported_blocks_count'] ?? 0),
            'recentPhotos' => array_map(function ($photo) {
                return [
                    'id' => $photo['id'],
                    'projectId' => $photo['project_id'],
                    'filePath' => $photo['file_path'],
                    'title' => $photo['title'],
                    'stage' => $photo['stage'] ?? null,
                    'createdAt' => $photo['created_at'],
                ];
            }, $this->resource['recent_photos'] ?? []),
            'upcomingDeadlines' => array_map(function ($deadline) {
                return [
                    'id' => $deadline['id'],
                    'title' => $deadline['title'],
                    'endDate' => $deadline['end_date'],
                    'projectName' => $deadline['project_name'] ?? null,
                    'type' => $deadline['type'] ?? 'task', // task or project
                ];
            }, $this->resource['upcoming_deadlines'] ?? []),
        ];
    }
}
