<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInvoiceRequest extends FormRequest
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
        $invoiceId = $this->route('invoice')?->id ?? $this->route('invoice');

        return [
            'quote_id' => 'sometimes|required|integer|exists:quotes,id',
            'account_id' => 'sometimes|required|integer|exists:accounts,id',
            'invoice_number' => 'sometimes|required|string|max:255|unique:invoices,invoice_number,' . $invoiceId,
            'title' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|max:255',
            'situation_percentage' => 'nullable|numeric|between:0,100',
            'status' => 'sometimes|required|string|max:255',
            'tva_rate' => 'nullable|numeric|min:0',
            'due_date' => 'nullable|date',
        ];
    }
}
