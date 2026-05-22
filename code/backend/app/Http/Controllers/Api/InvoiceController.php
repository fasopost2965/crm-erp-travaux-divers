<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Invoice::class, 'invoice');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
        $invoices = Invoice::with(['account', 'quote'])->paginate(10);
        return InvoiceResource::collection($invoices);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInvoiceRequest $request): InvoiceResource
    {
        $validated = $request->validated();
        $itemsData = $validated['items'] ?? [];
        unset($validated['items']);

        $invoice = Invoice::create($validated);

        foreach ($itemsData as $itemData) {
            $invoice->items()->create($itemData);
        }

        $invoice->recalculateTotals();
        $invoice->load(['account', 'quote', 'items', 'payments']);

        return new InvoiceResource($invoice);
    }

    /**
     * Display the specified resource.
     */
    public function show(Invoice $invoice): InvoiceResource
    {
        $invoice->load(['account', 'quote', 'items', 'payments']);
        return new InvoiceResource($invoice);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInvoiceRequest $request, Invoice $invoice): InvoiceResource
    {
        $validated = $request->validated();
        $itemsData = $validated['items'] ?? null;
        unset($validated['items']);

        $invoice->update($validated);

        if ($itemsData !== null) {
            $invoice->items()->delete();
            foreach ($itemsData as $itemData) {
                $invoice->items()->create($itemData);
            }
        }

        $invoice->recalculateTotals();
        $invoice->load(['account', 'quote', 'items', 'payments']);

        return new InvoiceResource($invoice->fresh());
    }

    /**
     * Record a payment for this invoice.
     */
    public function storePayment(\Illuminate\Http\Request $request, Invoice $invoice): InvoiceResource
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string|max:255',
            'reference' => 'nullable|string|max:255',
            'bank' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $validated['status'] = 'Validé'; // Default payment status

        $payment = $invoice->payments()->create($validated);

        // Update status of the invoice based on amount remaining
        $amountPaid = $invoice->amount_paid;
        $amountRemaining = $invoice->amount_remaining;

        if ($amountRemaining <= 0) {
            $invoice->status = 'Payée';
        } else if ($amountPaid > 0) {
            $invoice->status = 'Partiellement Payée';
        }

        $invoice->save();

        $invoice->load(['account', 'quote', 'items', 'payments']);
        return new InvoiceResource($invoice);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Invoice $invoice): JsonResponse
    {
        $invoice->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Export the specified invoice as PDF.
     */
    public function exportPdf(Invoice $invoice)
    {
        $this->authorize('view', $invoice);
        
        $invoice->load(['account', 'quote', 'items', 'payments']);
        
        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice
        ]);
        
        return $pdf->download('facture-' . $invoice->invoice_number . '.pdf');
    }
}
