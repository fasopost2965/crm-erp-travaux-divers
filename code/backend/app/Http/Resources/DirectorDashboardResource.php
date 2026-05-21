<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DirectorDashboardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'turnoverMonth' => (float) ($this->resource['turnover_month'] ?? 0),
            'quotesSent' => [
                'count' => (int) ($this->resource['quotes_sent']['count'] ?? 0),
                'amount' => (float) ($this->resource['quotes_sent']['amount'] ?? 0),
            ],
            'quotesWon' => [
                'count' => (int) ($this->resource['quotes_won']['count'] ?? 0),
                'amount' => (float) ($this->resource['quotes_won']['amount'] ?? 0),
                'conversionRate' => (float) ($this->resource['quotes_won']['conversion_rate'] ?? 0),
            ],
            'activeProjectsCount' => (int) ($this->resource['active_projects_count'] ?? 0),
            'unpaidInvoices' => [
                'count' => (int) ($this->resource['unpaid_invoices']['count'] ?? 0),
                'amount' => (float) ($this->resource['unpaid_invoices']['amount'] ?? 0),
            ],
            'estimatedMargin' => (float) ($this->resource['estimated_margin'] ?? 0),
            'monthlyEvolution' => array_map(function ($item) {
                return [
                    'month' => $item['month'],
                    'turnover' => (float) $item['turnover'],
                ];
            }, $this->resource['monthly_evolution'] ?? []),
        ];
    }
}
