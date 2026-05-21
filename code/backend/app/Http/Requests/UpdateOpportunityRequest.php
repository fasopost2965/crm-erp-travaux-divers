<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOpportunityRequest extends FormRequest
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
            'account_id' => 'sometimes|required|integer|exists:accounts,id',
            'lead_id' => 'nullable|integer|exists:leads,id',
            'title' => 'sometimes|required|string|max:255',
            'estimated_budget' => 'sometimes|required|numeric|min:0',
            'probability' => 'sometimes|required|integer|between:0,100',
            'status' => 'sometimes|required|string|max:255',
            'close_date' => 'sometimes|required|date',
            'assigned_to' => 'nullable|integer|exists:users,id',
        ];
    }
}
