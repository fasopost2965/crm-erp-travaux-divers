<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommercialDashboardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'newLeadsCount' => (int) ($this->resource['new_leads_count'] ?? 0),
            'todayFollowUpsCount' => (int) ($this->resource['today_follow_ups_count'] ?? 0),
            'activeOpportunities' => [
                'count' => (int) ($this->resource['active_opportunities']['count'] ?? 0),
                'pipelineAmount' => (float) ($this->resource['active_opportunities']['pipeline_amount'] ?? 0),
            ],
            'pendingQuotesCount' => (int) ($this->resource['pending_quotes_count'] ?? 0),
            'personalConversionRate' => (float) ($this->resource['personal_conversion_rate'] ?? 0),
            'upcomingMeetings' => array_map(function ($meeting) {
                return [
                    'id' => $meeting['id'],
                    'type' => $meeting['type'],
                    'subject' => $meeting['subject'],
                    'description' => $meeting['description'] ?? null,
                    'dueDate' => $meeting['due_date'],
                    'status' => $meeting['status'],
                ];
            }, $this->resource['upcoming_meetings'] ?? []),
        ];
    }
}
