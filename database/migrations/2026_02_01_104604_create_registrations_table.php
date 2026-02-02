<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registrations', function (Blueprint $table) {
            $table->id('reg_id');

            $table->enum('reg_type', [

                // 👤 اشخاص
                'patient',
                'doctor',
                'visitor',
                'customer',
                'staff',
                'supplier',

                // 💸 مصارف
                'rent',
                'electricity',
                'water',
                'internet',
                'salary',
                'fuel',
                'maintenance',

                // 📄 خدمات
                'laboratory',
                'transport',
                'consultation',

                // 🔘 سایر
                'expense',
                'income',
                'other'
            ])->comment('نوع راجستریشن');

            $table->string('full_name')->comment('نام شخص یا عنوان مصرف');
            $table->string('father_name')->nullable();
            $table->string('phone', 50)->nullable();

            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->smallInteger('age')->nullable();

            $table->string('blood_group', 10)->nullable();
            $table->text('address')->nullable();

            $table->date('visit_date')->nullable()->comment('تاریخ مراجعه یا مصرف');
            $table->text('note')->nullable();

            $table->tinyInteger('status')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
