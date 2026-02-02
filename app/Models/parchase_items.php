<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use HasFactory;

class parchase_items extends Model
{
protected $primaryKey = 'parchase_it_id';
 
protected $fillable = [
        'parchase_id',
        'med_id',
        'supplier_id',
        'quantity',
        'price',
        'total_price' ,

];

  
    public function parchases(): BelongsTo
    {
        return $this->belongsTo(Parchases::class, 'parchase_id', 'parchase_id');
    }

  
  
    public function medications(): BelongsTo
    {
        return $this->belongsTo(Medications::class, 'med_id', 'med_id');
    }

  
  
    public function suppliers(): BelongsTo
    {
        return $this->belongsTo(Suppliers::class, 'supplier_id', 'supplier_id');
    }

  

}
