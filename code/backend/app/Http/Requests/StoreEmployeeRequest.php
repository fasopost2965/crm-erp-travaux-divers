<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name'    => 'required|string|max:100',
            'last_name'     => 'required|string|max:100',
            'email'         => 'nullable|email|max:255',
            'phone'         => 'nullable|string|max:30',
            'position'      => 'required|string|max:150',
            'department'    => 'nullable|string|max:100',
            'contract_type' => 'required|in:CDI,CDD,Interim,Freelance,Stage',
            'hire_date'     => 'required|date',
            'end_date'      => 'nullable|date|after:hire_date',
            'salary'        => 'nullable|numeric|min:0',
            'status'        => 'nullable|in:Actif,Inactif,En congé,Suspendu',
            'cin'           => 'nullable|string|max:20',
            'cnss'          => 'nullable|string|max:30',
            'address'       => 'nullable|string|max:500',
            'notes'         => 'nullable|string',
            'user_id'       => 'nullable|exists:users,id',
        ];
    }
}
