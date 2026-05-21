<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuoteRequest;
use App\Http\Requests\UpdateQuoteRequest;
use App\Http\Resources\QuoteResource;
use App\Models\Quote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class QuoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
        $quotes = Quote::with(['account', 'opportunity', 'items'])->paginate(10);
        return QuoteResource::collection($quotes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreQuoteRequest $request): QuoteResource
    {
        $quote = Quote::create($request->validated());
        return new QuoteResource($quote);
    }

    /**
     * Display the specified resource.
     */
    public function show(Quote $quote): QuoteResource
    {
        $quote->load(['account', 'opportunity', 'items']);
        return new QuoteResource($quote);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateQuoteRequest $request, Quote $quote): QuoteResource
    {
        $quote->update($request->validated());
        $quote->recalculateTotals();
        return new QuoteResource($quote);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Quote $quote): JsonResponse
    {
        $quote->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
