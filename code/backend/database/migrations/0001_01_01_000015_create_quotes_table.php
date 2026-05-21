<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opportunity_id')->nullable()->constrained('opportunities')->nullOnDelete();
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->string('quote_number')->unique()->index();
            $table->string('title');
            $table->string('status')->default('Brouillon');
            $table->decimal('total_ht', 15, 2)->default(0.00);
            $table->decimal('tva_rate', 5, 2)->default(20.00);
            $table->decimal('total_ttc', 15, 2)->default(0.00);
            $table->decimal('margin_estimated', 15, 2)->nullable();
            $table->decimal('retention_rate', 5, 2)->nullable();
            $table->date('valid_until')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
