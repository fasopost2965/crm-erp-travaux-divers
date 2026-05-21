<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAccountRequest extends FormRequest
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
        $accountId = $this->route('account')?->id ?? $this->route('account');

        return [
            'name' => 'sometimes|required|string|max:255',
            'ice' => 'nullable|string|max:15|unique:accounts,ice,' . $accountId,
            'rc' => 'nullable|string|max:255',
            'patente' => 'nullable|string|max:255',
            'iff' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'owner_id' => 'nullable|integer|exists:users,id',
        ];
    }
}
