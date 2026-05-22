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
use Barryvdh\DomPDF\Facade\Pdf;

class QuoteController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Quote::class, 'quote');
    }

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
        $validated = $request->validated();
        $itemsData = $validated['items'] ?? [];
        unset($validated['items']);

        if (!isset($validated['created_by'])) {
            $validated['created_by'] = auth()->id();
        }

        $quote = Quote::create($validated);

        foreach ($itemsData as $itemData) {
            $quote->items()->create($itemData);
        }

        $quote->recalculateTotals();
        $quote->load(['account', 'opportunity', 'items']);

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
        $validated = $request->validated();
        $itemsData = $validated['items'] ?? null;
        unset($validated['items']);

        $quote->update($validated);

        if ($itemsData !== null) {
            $quote->items()->delete();
            foreach ($itemsData as $itemData) {
                $quote->items()->create($itemData);
            }
        }

        $quote->recalculateTotals();
        $quote->load(['account', 'opportunity', 'items']);

        return new QuoteResource($quote->fresh());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Quote $quote): JsonResponse
    {
        $quote->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Export the specified quote as PDF.
     */
    public function exportPdf(Quote $quote)
    {
        $this->authorize('view', $quote);
        
        $quote->load(['account', 'creator', 'items']);
        
        $pdf = Pdf::loadView('pdf.quote', [
            'quote' => $quote
        ]);
        
        return $pdf->download('devis-' . $quote->quote_number . '.pdf');
    }
}
