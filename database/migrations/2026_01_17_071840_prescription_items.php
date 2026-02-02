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

            $table->unsignedBigInteger('pres_id');  
            $table->unsignedBigInteger('med_id');
            $table->unsignedBigInteger('supplier_id');
            $table->unsignedBigInteger('category_id');
            
            $table->string('dosage');
            $table->integer('quantity');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_price', 15, 2);
            $table->string('type');
            $table->string('remarks');
         
            $table->timestamps();

            // تعریف کلیدهای خارجی
            $table->foreign('pres_id')->references('pres_id')->on('prescriptions')->onDelete('cascade');
            $table->foreign('med_id')->references('med_id')->on('medications')->onDelete('cascade');
            $table->foreign('supplier_id')->references('supplier_id')->on('suppliers')->onDelete('cascade');
            $table->foreign('category_id')->references('category_id')->on('categories')->onDelete('cascade');
        });
    }
           
           
           
           
           
           
           
           
           
                 
           
        
};
