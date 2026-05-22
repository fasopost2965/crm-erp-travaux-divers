<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuoteRequest extends FormRequest
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
        $quoteId = $this->route('quote')?->id ?? $this->route('quote');

        return [
            'opportunity_id' => 'sometimes|required|integer|exists:opportunities,id',
            'account_id' => 'sometimes|required|integer|exists:accounts,id',
            'quote_number' => 'sometimes|required|string|max:255|unique:quotes,quote_number,' . $quoteId,
            'title' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|string|max:255',
            'tva_rate' => 'nullable|numeric|min:0',
            'margin_estimated' => 'nullable|numeric|min:0',
            'retention_rate' => 'nullable|numeric|min:0',
            'valid_until' => 'nullable|date',
            'created_by' => 'nullable|integer|exists:users,id',
            'items' => 'nullable|array',
            'items.*.section' => 'nullable|string|max:255',
            'items.*.description' => 'required|string',
            'items.*.unit' => 'required|string|max:10',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price_ht' => 'required|numeric|min:0',
        ];
    }
}
