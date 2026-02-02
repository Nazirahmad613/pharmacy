<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SalesItem extends Model
{
    use HasFactory;

    protected $primaryKey = 'sales_it_id';

    protected $fillable = [
    'sales_id',
    'med_id',
    'supplier_id',
    'category_id',
    'type',
    'quantity',
    'unit_sales', // ✅ اصلاح شد
    'total_sales',
    'exp_date',
];


    public function sale()
    {
        return $this->belongsTo(Sales::class, 'sales_id', 'sales_id');
    }
}
