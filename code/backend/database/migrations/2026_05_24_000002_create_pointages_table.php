<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pointages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('personnel_id')->constrained('personnels')->cascadeOnDelete();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('date_pointage');
            $table->enum('presence', ['present', 'absent', 'demi_journee', 'conge', 'maladie'])->default('present');
            $table->decimal('heures_normales', 5, 2)->default(8);
            $table->decimal('heures_supplementaires', 5, 2)->default(0);
            $table->time('heure_arrivee')->nullable();
            $table->time('heure_depart')->nullable();
            $table->decimal('taux_journalier_applique', 10, 2)->nullable();
            $table->decimal('montant_jour', 10, 2)->nullable();
            $table->boolean('est_valide')->default(false);
            $table->text('observations')->nullable();
            $table->timestamps();

            $table->unique(['personnel_id', 'project_id', 'date_pointage']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pointages');
    }
};
