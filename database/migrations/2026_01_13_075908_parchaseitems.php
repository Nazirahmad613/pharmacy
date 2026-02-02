  <?php
 use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parchaseitems', function (Blueprint $table) {
            $table->bigIncrements('parchase_it_id');

            // ستون‌ها با نوع صحیح برای ارتباط با جدول اصلی
            $table->unsignedBigInteger('parchase_id');
            $table->unsignedBigInteger('med_id');
            $table->unsignedBigInteger('supplier_id');
            $table->unsignedBigInteger('category_id');

            $table->integer('quantity');
            $table->integer('unit_price');
            $table->integer('total_price');
            $table->date('exp_date');
            $table->timestamps();

            // تعریف کلیدهای خارجی
            $table->foreign('parchase_id')->references('parchase_id')->on('parchases')->onDelete('cascade');
            $table->foreign('med_id')->references('med_id')->on('medications')->onDelete('cascade');
            $table->foreign('supplier_id')->references('supplier_id')->on('suppliers')->onDelete('cascade');
            $table->foreign('category_id')->references('category_id')->on('categories')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parchaseitems');
    }
};
