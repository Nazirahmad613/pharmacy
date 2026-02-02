<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Sales extends Model
{
    use HasFactory;

    protected $table = 'sales';
    protected $primaryKey = 'sales_id';

    protected $fillable = [
        'cust_id',
        'sales_date',
        'total_sales',
        'discount',
        'net_sales',
        'sales_user',
        'total_paid',       // اضافه شد
    ];

    // 🔗 محاسبه ستون‌های derived در مدل
    protected $appends = [
        'remaining_amount',
        'payment_status',
    ];

    // 🔗 مشتری
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'cust_id', 'cust_id');
    }

    // 🔗 آیتم‌های فروش
    public function items()
    {
        return $this->hasMany(SalesItem::class, 'sales_id', 'sales_id');
    }

    // 🔗 کاربر فروشنده
    public function user()
    {
        return $this->belongsTo(User::class, 'sales_user', 'id');
    }

    // 🔗 محاسبه باقی‌مانده
    public function getRemainingAmountAttribute()
    {
        return $this->net_sales - $this->total_paid;
    }

    // 🔗 محاسبه وضعیت پرداخت
    public function getPaymentStatusAttribute()
    {
        if ($this->total_paid == 0) {
            return 'پرداخت نشده';
        } elseif ($this->total_paid < $this->net_sales) {
            return 'پرداخت جزئی';
        } else {
            return 'پرداخت کامل شده';
        }
    }
}
