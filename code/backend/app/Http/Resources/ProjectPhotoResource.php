<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProjectPhotoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'projectId' => $this->project_id,
            'title' => $this->title,
            'filePath' => $this->file_path,
            'fileUrl' => $this->file_path ? Storage::disk('public')->url($this->file_path) : null,
            'stage' => $this->stage,
            'uploadedBy' => $this->uploaded_by,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            'project' => new ProjectResource($this->whenLoaded('project')),
            'uploader' => new UserResource($this->whenLoaded('uploader')),
        ];
    }
}
