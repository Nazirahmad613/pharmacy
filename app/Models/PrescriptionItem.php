<?php
 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Prescription;
use App\Models\Medication;

class PrescriptionItem extends Model
{
    protected $primaryKey = 'pres_it_id';

    protected $fillable = [
     
        'pres_id',
        'med_id',
        'supplier_id',
        'category_id',
        'type',
        'dosage',   
        'quantity',
        'unit_price',
        'total_price', 
        'remarks', 
    ];

    // رابطه با نسخه
    public function prescription()
    {
        return $this->belongsTo(Prescription::class, 'pres_id', 'pres_id');
    }
    public function suppliers()
    {
        return $this->belongsTo(Suppliers::class, 'supplier_id', 'supplier_id');
    }
    public function categories()
    {
        return $this->belongsTo(Categories::class, 'category_id', 'category_id');
    }

    // رابطه با دوا
    public function medication()
    {
        return $this->belongsTo(Medication::class, 'med_id', 'med_id');
    }

    // حذف رابطه supplier() چون دیگر supplier_id وجود ندارد
}
