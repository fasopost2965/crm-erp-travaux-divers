<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('position');
            $table->string('department')->nullable();
            $table->enum('contract_type', ['CDI', 'CDD', 'Interim', 'Freelance', 'Stage'])->default('CDI');
            $table->date('hire_date');
            $table->date('end_date')->nullable();
            $table->decimal('salary', 10, 2)->nullable();
            $table->enum('status', ['Actif', 'Inactif', 'En congé', 'Suspendu'])->default('Actif');
            $table->string('cin')->nullable();
            $table->string('cnss')->nullable();
            $table->text('address')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
