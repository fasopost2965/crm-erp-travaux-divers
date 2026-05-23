<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContractResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'employeeId' => $this->employee_id,
            'type'       => $this->type,
            'startDate'  => $this->start_date?->toDateString(),
            'endDate'    => $this->end_date?->toDateString(),
            'salary'     => (float) $this->salary,
            'reference'  => $this->reference,
            'status'     => $this->status,
            'notes'      => $this->notes,
            'createdAt'  => $this->created_at?->toIso8601String(),
        ];
    }
}
