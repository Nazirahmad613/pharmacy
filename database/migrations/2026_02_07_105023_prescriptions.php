<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id('pres_id');

            $table->unsignedBigInteger('patient_id'); // reg_id مریض
            $table->unsignedBigInteger('doc_id');     // reg_id داکتر

            $table->string('pres_num')->nullable();
            $table->date('pres_date');

            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('net_amount', 12, 2)->default(0);

            $table->timestamps();

            // اگر registrations داری
            $table->foreign('patient_id')->references('reg_id')->on('registrations');
            $table->foreign('doc_id')->references('reg_id')->on('registrations');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
