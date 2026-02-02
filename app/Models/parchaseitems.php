<?php
 

namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Parchaseitems extends Model
{
    use HasFactory;

    protected $fillable = [
        'parchase_id',
        'med_id',
        'supplier_id',
        'category_id',
        'quantity',
        'unit_price',
        'total_price',
    ];

    /**
     * رابطه با دوا
     */
    public function medication(): BelongsTo
    {
        return $this->belongsTo(Medication::class, 'med_id', 'medication_med_id');
    }

    /**
     * رابطه با حمایت‌کننده
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id', 'supplier_id');
    }

    /**
     * رابطه با خرید
     */
    public function parchase(): BelongsTo
    {
        return $this->belongsTo(Parchases::class, 'parchase_id', 'parchase_id');
    }

    /**
     * رابطه با کتگوری
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }
}
