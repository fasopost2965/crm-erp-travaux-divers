<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkLogRequest extends FormRequest
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
            'project_task_id' => 'nullable|integer|exists:project_tasks,id',
            'user_id' => 'nullable|integer|exists:users,id',
            'work_date' => 'required|date',
            'hours_worked' => 'required|numeric|min:0.1|max:24',
            'description' => 'nullable|string',
        ];
    }
}
