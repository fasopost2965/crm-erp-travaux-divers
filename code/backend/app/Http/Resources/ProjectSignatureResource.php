<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectSignatureResource extends JsonResource
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
            'signedBy'      => $this->signed_by,
            'signatoryName' => $this->client_name,
            'signatoryRole' => $this->signatory_role,
            'notes'         => $this->notes,
            'signatureData' => $this->signature_data,
            'signedAt'      => $this->signed_at?->toIso8601String(),
            'createdAt'     => $this->created_at?->toIso8601String(),
            'updatedAt'     => $this->updated_at?->toIso8601String(),
            'project'       => new ProjectResource($this->whenLoaded('project')),
            'signer'        => new UserResource($this->whenLoaded('signer')),
        ];
    }
}
