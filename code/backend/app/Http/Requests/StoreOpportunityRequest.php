<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOpportunityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'account_id' => 'required|integer|exists:accounts,id',
            'lead_id' => 'nullable|integer|exists:leads,id',
            'title' => 'required|string|max:255',
            'estimated_budget' => 'required|numeric|min:0',
            'probability' => 'required|integer|between:0,100',
            'status' => 'required|string|max:255',
            'close_date' => 'required|date',
            'assigned_to' => 'nullable|integer|exists:users,id',
        ];
    }
}
