<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Requests\UpdateLeadRequest;
use App\Http\Resources\LeadResource;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class LeadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
        $leads = Lead::paginate(10);
        return LeadResource::collection($leads);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLeadRequest $request): LeadResource
    {
        $lead = Lead::create($request->validated());
        return new LeadResource($lead);
    }

    /**
     * Display the specified resource.
     */
    public function show(Lead $lead): LeadResource
    {
        return new LeadResource($lead);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLeadRequest $request, Lead $lead): LeadResource
    {
        $lead->update($request->validated());
        return new LeadResource($lead);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Lead $lead): JsonResponse
    {
        $lead->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
