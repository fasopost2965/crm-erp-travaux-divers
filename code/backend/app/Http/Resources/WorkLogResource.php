<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'projectId'     => $this->project_id,
            'projectTaskId' => $this->project_task_id,
            'userId'        => $this->user_id,
            'workDate'      => $this->work_date,
            'startTime'     => $this->start_time,
            'endTime'       => $this->end_time,
            'hoursWorked'   => (float) $this->hours_worked,
            'locationLat'   => $this->location_lat ? (float) $this->location_lat : null,
            'locationLng'   => $this->location_lng ? (float) $this->location_lng : null,
            'status'        => $this->status ?? 'submitted',
            'description'   => $this->description,
            'createdAt'     => $this->created_at?->toIso8601String(),
            'updatedAt'     => $this->updated_at?->toIso8601String(),
            'project'       => new ProjectResource($this->whenLoaded('project')),
            'task'          => new ProjectTaskResource($this->whenLoaded('task')),
            'user'          => new UserResource($this->whenLoaded('user')),
        ];
    }
}
