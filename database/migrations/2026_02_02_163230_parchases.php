<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parchases', function (Blueprint $table) {
            $table->id('parchase_id');
            $table->date('parchase_date');
            $table->bigInteger('total_parchase')->default(0);
            $table->bigInteger('par_paid')->default(0);
            $table->bigInteger('due_par')->default(0);
            $table->string('purpose')->default('دارو'); // هدف خرید
            $table->unsignedBigInteger('par_user')->nullable(); // کاربر ثبت‌کننده
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parchases');
    }
};
