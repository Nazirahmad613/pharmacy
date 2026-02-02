      <?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   
    public function up()
    {
        Schema::create('sales_items', function (Blueprint $table) {
            $table->id('sales_it_id');
            $table->unsignedBigInteger('sales_id'); // Foreign key to sales
            $table->unsignedBigInteger('med_id'); // Foreign key to medications
            $table->unsignedBigInteger('supplier_id'); // Foreign key to suppliers
            $table->unsignedBigInteger('category_id');
            $table->string('type');  
            $table->integer('quantity');
            $table->decimal('unit_sales', 15, 2);
            $table->decimal('total_sales', 15, 2);
            $table->date('exp_date');
            
            
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('sales_id')->references('sales_id')->on('sales')->onDelete('cascade');
            $table->foreign('med_id')->references('med_id')->on('medications')->onDelete('cascade');
            $table->foreign('supplier_id')->references('supplier_id')->on('suppliers')->onDelete('cascade');
            $table->foreign('category_id')->references('category_id')->on('categories')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('sales_items');
    }





};
