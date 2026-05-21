<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOpportunityRequest;
use App\Http\Requests\UpdateOpportunityRequest;
use App\Http\Resources\OpportunityResource;
use App\Models\Opportunity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class OpportunityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
        $opportunities = Opportunity::with('account')->paginate(10);
        return OpportunityResource::collection($opportunities);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOpportunityRequest $request): OpportunityResource
    {
        $opportunity = Opportunity::create($request->validated());
        return new OpportunityResource($opportunity);
    }

    /**
     * Display the specified resource.
     */
    public function show(Opportunity $opportunity): OpportunityResource
    {
        $opportunity->load('account');
        return new OpportunityResource($opportunity);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOpportunityRequest $request, Opportunity $opportunity): OpportunityResource
    {
        $opportunity->update($request->validated());
        return new OpportunityResource($opportunity);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Opportunity $opportunity): JsonResponse
    {
        $opportunity->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
