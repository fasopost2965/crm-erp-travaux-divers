<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('engins', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('designation');
            $table->enum('type', ['grue', 'pelleteuse', 'camion', 'compacteur', 'pompe_beton', 'echafaudage', 'autre']);
            $table->string('marque')->nullable();
            $table->string('modele')->nullable();
            $table->string('immatriculation')->nullable();
            $table->integer('annee_fabrication')->nullable();
            $table->decimal('taux_location_journalier', 10, 2)->nullable();
            $table->enum('statut', ['disponible', 'en_chantier', 'en_maintenance', 'retire'])->default('disponible');
            $table->date('prochaine_revision')->nullable();
            $table->integer('compteur_heures')->default(0);
            $table->text('observations')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('engin_affectations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('engin_id')->constrained('engins')->cascadeOnDelete();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->decimal('nb_jours', 6, 2)->nullable();
            $table->decimal('cout_total', 10, 2)->nullable();
            $table->text('observations')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('engin_affectations');
        Schema::dropIfExists('engins');
    }
};
