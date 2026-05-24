<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personnels', function (Blueprint $table) {
            $table->id();
            $table->string('matricule')->unique();
            $table->string('nom');
            $table->string('prenom');
            $table->string('cin')->nullable()->unique();
            $table->string('telephone')->nullable();
            $table->string('email')->nullable();
            $table->enum('type_contrat', ['CDI', 'CDD', 'journalier', 'sous_traitant'])->default('CDI');
            $table->string('poste')->nullable();
            $table->string('specialite')->nullable();
            $table->decimal('taux_journalier', 10, 2)->nullable();
            $table->decimal('salaire_base', 10, 2)->nullable();
            $table->string('numero_cnss')->nullable();
            $table->date('date_embauche')->nullable();
            $table->date('date_fin_contrat')->nullable();
            $table->enum('statut', ['actif', 'inactif', 'conge', 'suspendu'])->default('actif');
            $table->string('rib_bancaire')->nullable();
            $table->string('banque')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personnels');
    }
};
