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
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'location_lat' => 'nullable|numeric|between:-90,90',
            'location_lng' => 'nullable|numeric|between:-180,180',
            'status' => 'nullable|in:draft,submitted,validated',
        ];
    }
}
