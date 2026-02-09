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

    // نوع رویداد (از registrations.reg_type)
    $table->string('ref_type');

    // آی‌دی رویداد (از registrations.reg_id)
    $table->unsignedBigInteger('ref_id');

    // کاربر
    $table->unsignedBigInteger('user_id')->nullable();

    $table->timestamps();

    // تضمین ارتباط با users
    $table->foreign('user_id')
          ->references('id')
          ->on('users')
          ->nullOnDelete();

    /*
     ⚠️ توجه مهم:
     ref_id به registrations.reg_id وصل است
     اما چون reg_type هم دخیل است،
     FK دیتابیسی مستقیم نمی‌زنیم،
     تضمین را در سطح APPLICATION انجام می‌دهیم
    */
});


    }

    public function down(): void
    {
        Schema::dropIfExists('journals');
    }
};

