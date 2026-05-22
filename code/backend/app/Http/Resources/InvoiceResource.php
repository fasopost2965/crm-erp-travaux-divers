<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
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
            'invoiceNumber' => $this->invoice_number,
            'title' => $this->title,
            'type' => $this->type,
            'situationPercentage' => (float) $this->situation_percentage,
            'status' => $this->status,
            'totalHt' => (float) $this->total_ht,
            'tvaRate' => (float) $this->tva_rate,
            'totalTtc' => (float) $this->total_ttc,
            'amountPaid' => (float) $this->amount_paid,
            'amountRemaining' => (float) $this->amount_remaining,
            'dueDate' => $this->due_date,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            // Loaded relations
            'account' => new AccountResource($this->whenLoaded('account')),
            'quote' => new QuoteResource($this->whenLoaded('quote')),
            'items' => InvoiceItemResource::collection($this->whenLoaded('items')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
        ];
    }
}
