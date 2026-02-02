<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id('sales_id');

            $table->date('sales_date');

            // 🔗 مشتری
            $table->unsignedBigInteger('cust_id');

            // 🔗 کاربر فروشنده
            $table->unsignedBigInteger('sales_user');

            // 💰 مبالغ
            $table->decimal('total_sales', 15, 2);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('net_sales', 15, 2);

            // ===== پرداخت =====
            $table->decimal('total_paid', 15, 2)->default(0);

            // ⛔ توجه: این دو ستون فقط در MySQL 8+ درست کار می‌کند
            $table->decimal('remaining_amount', 15, 2)
                  ->virtualAs('net_sales - total_paid');

            $table->enum('payment_status', [
                'پرداخت نشده',
                'پرداخت جزئی',
                'پرداخت کامل شده'
            ])->virtualAs("
                CASE
                    WHEN total_paid = 0 THEN 'پرداخت نشده'
                    WHEN total_paid < net_sales THEN 'پرداخت جزئی'
                    ELSE 'پرداخت کامل شده'
                END
            ");

            // 🔐 کلیدهای خارجی
            $table->foreign('cust_id')
                  ->references('cust_id')
                  ->on('customers')
                  ->onDelete('cascade');

            $table->foreign('sales_user')
                  ->references('id')
                  ->on('users')
                  ->onDelete('restrict');

            // ⏱ timestamps
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('sales');
    }
};
