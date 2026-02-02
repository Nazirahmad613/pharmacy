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
        Schema::create('parchases', function (Blueprint $table) {
         $table->bigIncrements('parchase_id');
         $table->integer('supplier_id');
         $table->date('parchase_date'); 
         $table->integer('total_parchase');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parchases');
    }
};
