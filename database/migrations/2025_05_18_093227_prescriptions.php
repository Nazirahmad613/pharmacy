<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

         
    public function up()
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->bigIncrements('pres_id');
            $table->string('pa_name');
            $table->decimal('pa_age',15,2);
            $table->date('pres_date');
            $table->unsignedBigInteger('doc_id'); // Foreign key to doctors
            $table->decimal('total_amount', 15, 2);
            $table->decimal('discount', 15, 2)->nullable()->default(0);
            $table->decimal('net_amount', 15, 2);
            $table->unsignedBigInteger('created_by'); // User who created the sale
            $table->timestamps();
            $table->foreign('doc_id')->references('doc_id')->on('doctors')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('prescriptions');
    }






     
};
