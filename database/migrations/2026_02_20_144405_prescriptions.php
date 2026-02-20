  <?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id('pres_id'); // کلید اصلی و اتو اینکریمنت

            // اطلاعات مریض
            $table->unsignedBigInteger('patient_id');
            $table->string('patient_name')->nullable();
            $table->integer('patient_age')->nullable();
            $table->string('patient_phone')->nullable();
            $table->string('patient_blood_group')->nullable();

            // اطلاعات داکتر
            $table->unsignedBigInteger('doc_id');
            $table->string('doc_name')->nullable();

            // شماره نسخه
             $table->unsignedBigInteger('pres_num')->unique();
            $table->date('pres_date');

            // مبالغ
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('net_amount', 12, 2)->default(0);

            $table->timestamps();

            // روابط
            $table->foreign('patient_id')->references('reg_id')->on('registrations');
            $table->foreign('doc_id')->references('reg_id')->on('registrations');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};