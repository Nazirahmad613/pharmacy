<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Prescription extends Model
{
    use HasFactory;

    protected $primaryKey = 'pres_id';

    protected $fillable = [
        'patient_id',
        'doc_id',
        'pres_num',
        'pres_date',
        'total_amount',
        'discount',
        'net_amount',
    ];

    public function items()
    {
        return $this->hasMany(PrescriptionItem::class, 'pres_id', 'pres_id');
    }

    public function patient()
    {
        return $this->belongsTo(Registration::class, 'patient_id', 'reg_id');
    }

    public function doctor()
    {
        return $this->belongsTo(Registration::class, 'doc_id', 'reg_id');
    }
}
