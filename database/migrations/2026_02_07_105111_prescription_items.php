<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('prescription_items', function (Blueprint $table) {
            $table->id('pres_it_id');

            $table->unsignedBigInteger('pres_id');
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('med_id');
            $table->unsignedBigInteger('supplier_id'); // reg_id حمایت‌کننده

            $table->string('type')->nullable();
            $table->string('dosage')->nullable();

            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total_price', 12, 2);

            $table->text('remarks')->nullable();

            $table->timestamps();

            $table->foreign('pres_id')->references('pres_id')->on('prescriptions')->cascadeOnDelete();
            $table->foreign('category_id')->references('category_id')->on('categories');
            $table->foreign('med_id')->references('med_id')->on('medications');
            $table->foreign('supplier_id')->references('reg_id')->on('registrations');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescription_items');
    }
};
