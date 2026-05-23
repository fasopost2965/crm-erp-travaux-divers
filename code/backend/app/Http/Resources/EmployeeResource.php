<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'userId'       => $this->user_id,
            'firstName'    => $this->first_name,
            'lastName'     => $this->last_name,
            'fullName'     => $this->full_name,
            'email'        => $this->email,
            'phone'        => $this->phone,
            'position'     => $this->position,
            'department'   => $this->department,
            'contractType' => $this->contract_type,
            'hireDate'     => $this->hire_date?->toDateString(),
            'endDate'      => $this->end_date?->toDateString(),
            'salary'       => $this->salary !== null ? (float) $this->salary : null,
            'status'       => $this->status,
            'cin'          => $this->cin,
            'cnss'         => $this->cnss,
            'address'      => $this->address,
            'notes'        => $this->notes,
            'createdAt'    => $this->created_at?->toIso8601String(),
            'contracts'    => ContractResource::collection($this->whenLoaded('contracts')),
            'activeContract' => new ContractResource($this->whenLoaded('activeContract')),
        ];
    }
}
