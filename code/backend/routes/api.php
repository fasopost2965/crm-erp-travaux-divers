<?php

use App\Http\Controllers\Api\AccountController;
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
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::apiResource('accounts', AccountController::class);
Route::apiResource('contacts', ContactController::class);
Route::apiResource('leads', LeadController::class);
Route::apiResource('opportunities', OpportunityController::class);
Route::apiResource('quotes', QuoteController::class);
Route::apiResource('invoices', InvoiceController::class);
Route::apiResource('projects', ProjectController::class);
