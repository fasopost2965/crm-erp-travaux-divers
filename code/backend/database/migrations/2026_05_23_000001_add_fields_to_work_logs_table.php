<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_logs', function (Blueprint $table) {
            $table->time('start_time')->nullable()->after('work_date');
            $table->time('end_time')->nullable()->after('start_time');
            $table->decimal('location_lat', 10, 7)->nullable()->after('hours_worked');
            $table->decimal('location_lng', 10, 7)->nullable()->after('location_lat');
            $table->enum('status', ['draft', 'submitted', 'validated'])->default('submitted')->after('location_lng');
        });
    }

    public function down(): void
    {
        Schema::table('work_logs', function (Blueprint $table) {
            $table->dropColumn(['start_time', 'end_time', 'location_lat', 'location_lng', 'status']);
        });
    }
};
