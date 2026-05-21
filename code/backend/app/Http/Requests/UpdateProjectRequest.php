<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
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
            'quote_id' => 'sometimes|required|integer|exists:quotes,id',
            'account_id' => 'sometimes|required|integer|exists:accounts,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'status' => 'sometimes|required|string|max:255',
            'budget' => 'sometimes|required|numeric|min:0',
            'start_date' => 'sometimes|required|date',
            'end_date_planned' => 'sometimes|required|date|after_or_equal:start_date',
            'end_date_actual' => 'nullable|date|after_or_equal:start_date',
            'project_manager_id' => 'sometimes|required|integer|exists:users,id',
        ];
    }
}
