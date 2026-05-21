<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountResource extends JsonResource
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
            'name' => $this->name,
            'ice' => $this->ice,
            'rc' => $this->rc,
            'patente' => $this->patente,
            'iff' => $this->iff,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'ownerId' => $this->owner_id,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            // Loaded relations
            'contacts' => ContactResource::collection($this->whenLoaded('contacts')),
            'opportunities' => OpportunityResource::collection($this->whenLoaded('opportunities')),
        ];
    }
}
