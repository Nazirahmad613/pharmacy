<?php
 namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Parchase extends Model
{
    protected $table = 'parchases';   // 👈 مهم
    protected $primaryKey = 'parchase_id';

    protected $fillable = [
        'supplier_id',
        'parchase_date',
        'total_parchase',
    ];

    public function items()
    {
        return $this->hasMany(
            ParchaseItem::class,
            'parchase_id',
            'parchase_id'
        );
    }
}
