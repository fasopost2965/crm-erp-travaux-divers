<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteResource extends JsonResource
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
            'opportunityId' => $this->opportunity_id,
            'accountId' => $this->account_id,
            'quoteNumber' => $this->quote_number,
            'title' => $this->title,
            'status' => $this->status,
            'totalHt' => (float) $this->total_ht,
            'tvaRate' => (float) $this->tva_rate,
            'totalTtc' => (float) $this->total_ttc,
            'marginEstimated' => (float) $this->margin_estimated,
            'retentionRate' => (float) $this->retention_rate,
            'validUntil' => $this->valid_until,
            'createdBy' => $this->created_by,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            // Loaded relations
            'account' => new AccountResource($this->whenLoaded('account')),
            'opportunity' => new OpportunityResource($this->whenLoaded('opportunity')),
            'items' => QuoteItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
