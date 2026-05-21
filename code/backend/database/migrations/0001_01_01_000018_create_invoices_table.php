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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_id')->nullable()->constrained('quotes')->nullOnDelete();
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->string('invoice_number')->unique()->index();
            $table->string('title');
            $table->string('type')->default('Standard');
            $table->decimal('situation_percentage', 5, 2)->nullable();
            $table->string('status')->default('Brouillon');
            $table->decimal('total_ht', 15, 2)->default(0.00);
            $table->decimal('tva_rate', 5, 2)->default(20.00);
            $table->decimal('total_ttc', 15, 2)->default(0.00);
            $table->decimal('retention_amount', 15, 2)->nullable();
            $table->date('due_date');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
