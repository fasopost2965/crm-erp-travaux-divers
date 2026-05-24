<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\OpportunityController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ProjectTaskController;
use App\Http\Controllers\Api\WorkLogController;
use App\Http\Controllers\Api\ProjectPhotoController;
use App\Http\Controllers\Api\ProjectDocumentController;
use App\Http\Controllers\Api\ProjectSignatureController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PersonnelController;
use App\Http\Controllers\Api\PointageController;
use App\Http\Controllers\Api\MouvementController;
use App\Http\Controllers\Api\EnginController;
use App\Http\Controllers\Api\StockController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Atlas Works ERP
|--------------------------------------------------------------------------
*/

// Public Authentication Routes
Route::post('auth/login', [AuthController::class, 'login']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth profile & logout
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);

    // Users list
    Route::get('users', function () {
        return \App\Http\Resources\UserResource::collection(\App\Models\User::with('role')->get());
    });

    // ─── CRM ────────────────────────────────────────────────────────────────
    Route::apiResource('accounts', AccountController::class);
    Route::apiResource('contacts', ContactController::class);
    Route::apiResource('leads', LeadController::class);
    Route::apiResource('opportunities', OpportunityController::class);

    // ─── Devis & Facturation ────────────────────────────────────────────────
    Route::apiResource('quotes', QuoteController::class);
    Route::get('quotes/{quote}/pdf', [QuoteController::class, 'exportPdf']);
    Route::apiResource('invoices', InvoiceController::class);
    Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'exportPdf']);
    Route::post('invoices/{invoice}/payments', [InvoiceController::class, 'storePayment']);

    // ─── Projets / Chantiers ────────────────────────────────────────────────
    Route::apiResource('projects', ProjectController::class);
    Route::get('projects/{project}/pv-pdf', [ProjectController::class, 'exportPV']);
    Route::apiResource('projects.tasks', ProjectTaskController::class);
    Route::apiResource('projects.work-logs', WorkLogController::class);
    Route::apiResource('projects.photos', ProjectPhotoController::class)->except(['update']);
    Route::apiResource('projects.documents', ProjectDocumentController::class);
    Route::apiResource('projects.signatures', ProjectSignatureController::class)->only(['index', 'store', 'show']);

    // ─── RH & Personnel ─────────────────────────────────────────────────────
    Route::apiResource('personnels', PersonnelController::class);

    // ─── Pointage journalier ────────────────────────────────────────────────
    Route::get('pointages', [PointageController::class, 'index']);
    Route::post('pointages', [PointageController::class, 'store']);
    Route::put('pointages/{pointage}', [PointageController::class, 'update']);
    Route::delete('pointages/{pointage}', [PointageController::class, 'destroy']);
    Route::post('pointages/valider-journee', [PointageController::class, 'validerJournee']);

    // ─── Trésorerie (Mouvements) ─────────────────────────────────────────────
    Route::apiResource('mouvements', MouvementController::class);

    // ─── Parc Engins ────────────────────────────────────────────────────────
    Route::apiResource('engins', EnginController::class);
    Route::post('engins/{engin}/affecter', [EnginController::class, 'affecter']);

    // ─── Achats & Stock ──────────────────────────────────────────────────────
    Route::prefix('stock')->group(function () {
        Route::get('articles', [StockController::class, 'articles']);
        Route::post('articles', [StockController::class, 'storeArticle']);
        Route::get('fournisseurs', [StockController::class, 'fournisseurs']);
        Route::post('fournisseurs', [StockController::class, 'storeFournisseur']);
        Route::get('bons-commande', [StockController::class, 'bonsCommande']);
        Route::post('bons-commande', [StockController::class, 'storeBonCommande']);
        Route::post('bons-commande/{bonCommande}/receptionner', [StockController::class, 'receptionnerBon']);
    });

    // ─── Dashboards décisionnels par rôle ───────────────────────────────────
    Route::prefix('dashboard')->group(function () {
        Route::get('director', [DashboardController::class, 'director'])->middleware('role:directeur,admin');
        Route::get('commercial', [DashboardController::class, 'commercial'])->middleware('role:commercial');
        Route::get('project-manager', [DashboardController::class, 'projectManager'])->middleware('role:chef_chantier');
        Route::get('finance', [DashboardController::class, 'finance'])->middleware('role:finance');
    });
});
