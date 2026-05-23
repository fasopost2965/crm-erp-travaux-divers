<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type'       => 'required|in:CDI,CDD,Interim,Freelance,Stage',
            'start_date' => 'required|date',
            'end_date'   => 'nullable|date|after:start_date',
            'salary'     => 'required|numeric|min:0',
            'reference'  => 'nullable|string|max:100',
            'status'     => 'nullable|in:En cours,Expiré,Résilié',
            'notes'      => 'nullable|string',
        ];
    }
}
