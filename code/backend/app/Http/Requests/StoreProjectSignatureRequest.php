<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectSignatureRequest extends FormRequest
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
            'signed_by'      => 'nullable|integer|exists:users,id',
            'client_name'    => 'required|string|max:255',
            'signatory_role' => 'nullable|string|max:255',
            'notes'          => 'nullable|string',
            'signature_data' => 'required|string',
            'signed_at'      => 'required|date',
        ];
    }
}
