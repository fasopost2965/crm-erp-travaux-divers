<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectPhotoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'projectId' => $this->project_id,
            'title' => $this->title,
            'filePath' => $this->file_path,
            'stage' => $this->stage,
            'uploadedBy' => $this->uploaded_by,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            // Loaded relations
            'project' => new ProjectResource($this->whenLoaded('project')),
            'uploader' => new UserResource($this->whenLoaded('uploader')),
        ];
    }
}
