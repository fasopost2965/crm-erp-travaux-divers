<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mouvements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('reference')->unique();
            $table->enum('type', ['encaissement', 'decaissement']);
            $table->enum('categorie', [
                'reglement_client', 'acompte_client',
                'achat_materiau', 'salaires', 'sous_traitant',
                'location_engin', 'charges_fixes', 'impots_taxes', 'autre'
            ]);
            $table->string('libelle');
            $table->decimal('montant_ht', 12, 2)->default(0);
            $table->decimal('tva', 5, 2)->default(0);
            $table->decimal('montant_ttc', 12, 2);
            $table->date('date_mouvement');
            $table->enum('mode_paiement', ['virement', 'cheque', 'especes', 'effet', 'autre'])->default('virement');
            $table->string('piece_jointe')->nullable();
            $table->enum('statut', ['prevu', 'realise', 'annule'])->default('realise');
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mouvements');
    }
};
