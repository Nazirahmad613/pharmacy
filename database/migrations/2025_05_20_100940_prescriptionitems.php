<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
     public function up()
    {
        Schema::create('prescription_items', function (Blueprint $table) {
            $table->bigIncrements('pres_it_id');
            $table->string('dosage');
            $table->unsignedBigInteger('pres_id');  
            $table->unsignedBigInteger('med_id'); // Foreign key to medications
            $table->unsignedBigInteger('supplier_id'); // Foreign key to suppliers
            $table->integer('quantity');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_price', 15, 2);
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('pres_id')->references('pres_id')->on('prescriptions')->onDelete('cascade');
            $table->foreign('med_id')->references('med_id')->on('medications')->onDelete('cascade');
            $table->foreign('supplier_id')->references('supplier_id')->on('suppliers')->onDelete('cascade');
        });
    }

};
