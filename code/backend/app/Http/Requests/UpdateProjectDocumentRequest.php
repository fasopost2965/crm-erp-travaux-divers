<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectDocumentRequest extends FormRequest
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
            'title' => 'sometimes|required|string|max:255',
            'file_path' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|max:255',
            'uploaded_by' => 'nullable|integer|exists:users,id',
        ];
    }
}
