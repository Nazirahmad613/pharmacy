<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('journals', function (Blueprint $table) {

            $table->id();

            // تاریخ ژورنال
            $table->date('journal_date');

            // بدهکار / بستانکار
            $table->enum('entry_type', ['debit', 'credit']);

            // توضیحات
            $table->string('description')->nullable();

            // مبلغ
            $table->decimal('amount', 15, 2);

            // نوع رویداد
            $table->string('ref_type');

            // آی‌دی رویداد
            $table->unsignedBigInteger('ref_id');

            // ==============================
            // ✅ ستون‌های جدید اضافه شده
            // ==============================

            $table->unsignedBigInteger('patient_id')->nullable();
            $table->unsignedBigInteger('doc_id')->nullable();
            $table->unsignedBigInteger('cust_id')->nullable();
            $table->unsignedBigInteger('supplier_id')->nullable();
            $table->unsignedBigInteger('med_id')->nullable();

            // ==============================

            // کاربر
            $table->unsignedBigInteger('user_id')->nullable();

            $table->timestamps();

            // ==============================
            // Foreign Keys
            // ==============================

            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->nullOnDelete();

            $table->foreign('patient_id')
                  ->references('reg_id')
                  ->on('registrations')
                  ->nullOnDelete();

            $table->foreign('doc_id')
                  ->references('reg_id')
                  ->on('registrations')
                  ->nullOnDelete();

            $table->foreign('cust_id')
                  ->references('reg_id')
                  ->on('registrations')
                  ->nullOnDelete();

            $table->foreign('supplier_id')
                  ->references('reg_id')
                  ->on('registrations')
                  ->nullOnDelete();

            $table->foreign('med_id')
                  ->references('med_id')
                  ->on('medications')
                  ->nullOnDelete();

            /*
             ⚠️ توجه:
             ref_id همچنان FK مستقیم ندارد
             چون وابسته به ref_type است
             و این منطق در سطح Application مدیریت می‌شود
            */
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journals');
    }
};
