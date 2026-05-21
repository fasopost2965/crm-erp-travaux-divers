<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
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
            'quote_id' => 'required|integer|exists:quotes,id',
            'account_id' => 'required|integer|exists:accounts,id',
            'invoice_number' => 'required|string|max:255|unique:invoices,invoice_number',
            'title' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'situation_percentage' => 'nullable|numeric|between:0,100',
            'status' => 'required|string|max:255',
            'tva_rate' => 'nullable|numeric|min:0',
            'due_date' => 'nullable|date',
        ];
    }
}
