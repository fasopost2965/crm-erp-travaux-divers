<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
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
            'quoteId' => $this->quote_id,
            'accountId' => $this->account_id,
            'title' => $this->title,
            'description' => $this->description,
            'address' => $this->address,
            'city' => $this->city,
            'status' => $this->status,
            'budget' => (float) $this->budget,
            'startDate' => $this->start_date,
            'endDatePlanned' => $this->end_date_planned,
            'endDateActual' => $this->end_date_actual,
            'projectManagerId' => $this->project_manager_id,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            // Loaded relations
            'account' => new AccountResource($this->whenLoaded('account')),
            'quote' => new QuoteResource($this->whenLoaded('quote')),
            'manager' => new UserResource($this->whenLoaded('manager')),
        ];
    }
}
