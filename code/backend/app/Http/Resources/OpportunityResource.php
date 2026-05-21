<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OpportunityResource extends JsonResource
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
            'accountId' => $this->account_id,
            'leadId' => $this->lead_id,
            'title' => $this->title,
            'estimatedBudget' => (float) $this->estimated_budget,
            'probability' => (int) $this->probability,
            'status' => $this->status,
            'closeDate' => $this->close_date,
            'assignedTo' => $this->assigned_to,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            // Loaded relations
            'account' => new AccountResource($this->whenLoaded('account')),
        ];
    }
}
