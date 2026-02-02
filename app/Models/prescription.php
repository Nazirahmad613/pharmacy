<?php
 namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use App\Models\Doctor;
use App\Models\PrescriptionItem;
class Prescription extends Model
{
    protected $primaryKey = 'pres_id';

    protected $fillable = [
        'pres_num',
        'pa_name',
        'pa_age',
        'pres_date',
        'doc_id',
        'total_amount',
        'discount',
        'net_amount',
        'created_by'
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doc_id', 'doc_id');
    }

    public function items()
    {
        return $this->hasMany(PrescriptionItem::class, 'pres_id', 'pres_id');
    }
}