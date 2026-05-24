<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fournisseurs', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('raison_sociale');
            $table->string('ice')->nullable();
            $table->string('telephone')->nullable();
            $table->string('email')->nullable();
            $table->string('ville')->nullable();
            $table->string('categorie')->nullable();
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('designation');
            $table->string('unite');
            $table->string('categorie')->nullable();
            $table->decimal('prix_unitaire', 10, 2)->default(0);
            $table->decimal('stock_actuel', 10, 3)->default(0);
            $table->decimal('stock_min', 10, 3)->default(0);
            $table->string('emplacement')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('bons_commande', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique();
            $table->foreignId('fournisseur_id')->constrained('fournisseurs')->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->date('date_commande');
            $table->date('date_livraison_prevue')->nullable();
            $table->date('date_livraison_reelle')->nullable();
            $table->enum('statut', ['brouillon', 'envoye', 'en_cours', 'livre', 'annule'])->default('brouillon');
            $table->decimal('montant_ht', 12, 2)->default(0);
            $table->decimal('tva', 5, 2)->default(20);
            $table->decimal('montant_ttc', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('bon_commande_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bon_commande_id')->constrained('bons_commande')->cascadeOnDelete();
            $table->foreignId('article_id')->constrained('articles')->cascadeOnDelete();
            $table->decimal('quantite', 10, 3);
            $table->decimal('prix_unitaire', 10, 2);
            $table->decimal('montant_ht', 10, 2);
            $table->decimal('quantite_recue', 10, 3)->default(0);
            $table->timestamps();
        });

        Schema::create('mouvements_stock', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained('articles')->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->foreignId('bon_commande_id')->nullable()->constrained('bons_commande')->nullOnDelete();
            $table->enum('type', ['entree', 'sortie', 'retour', 'ajustement']);
            $table->decimal('quantite', 10, 3);
            $table->decimal('prix_unitaire', 10, 2)->nullable();
            $table->date('date_mouvement');
            $table->string('motif')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mouvements_stock');
        Schema::dropIfExists('bon_commande_items');
        Schema::dropIfExists('bons_commande');
        Schema::dropIfExists('articles');
        Schema::dropIfExists('fournisseurs');
    }
};
