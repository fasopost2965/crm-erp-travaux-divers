<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\OpportunityController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\QuoteController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Authentication Routes
Route::post('auth/login', [AuthController::class, 'login']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth profile & logout
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);

    // Resource CRUD endpoints (protected by Sanctum + Policies)
    Route::apiResource('accounts', AccountController::class);
    Route::apiResource('contacts', ContactController::class);
    Route::apiResource('leads', LeadController::class);
    Route::apiResource('opportunities', OpportunityController::class);
    Route::apiResource('quotes', QuoteController::class);
    Route::apiResource('invoices', InvoiceController::class);
    Route::apiResource('projects', ProjectController::class);
});
