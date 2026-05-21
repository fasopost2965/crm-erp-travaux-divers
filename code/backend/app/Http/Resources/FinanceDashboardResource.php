<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FinanceDashboardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'invoicesIssued' => [
                'count' => (int) ($this->resource['invoices_issued']['count'] ?? 0),
                'amount' => (float) ($this->resource['invoices_issued']['amount'] ?? 0),
            ],
            'paymentsReceivedAmount' => (float) ($this->resource['payments_received_amount'] ?? 0),
            'unpaidInvoices' => [
                'totalAmount' => (float) ($this->resource['unpaid_invoices']['total_amount'] ?? 0),
                'list' => array_map(function ($invoice) {
                    return [
                        'id' => $invoice['id'],
                        'invoiceNumber' => $invoice['invoice_number'],
                        'title' => $invoice['title'],
                        'status' => $invoice['status'],
                        'totalTtc' => (float) $invoice['total_ttc'],
                        'dueDate' => $invoice['due_date'],
                    ];
                }, $this->resource['unpaid_invoices']['list'] ?? []),
            ],
            'upcomingDueDates' => [
                'totalAmount' => (float) ($this->resource['upcoming_due_dates']['total_amount'] ?? 0),
                'list' => array_map(function ($invoice) {
                    return [
                        'id' => $invoice['id'],
                        'invoiceNumber' => $invoice['invoice_number'],
                        'title' => $invoice['title'],
                        'totalTtc' => (float) $invoice['total_ttc'],
                        'dueDate' => $invoice['due_date'],
                    ];
                }, $this->resource['upcoming_due_dates']['list'] ?? []),
            ],
            'collectionRate' => (float) ($this->resource['collection_rate'] ?? 0),
        ];
    }
}
