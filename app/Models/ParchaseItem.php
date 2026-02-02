<?php
  namespace App\Models;
 

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParchaseItem extends Model
{
    use HasFactory;

    protected $table = 'parchaseitems';
    protected $primaryKey = 'parchase_it_id';

    protected $fillable = [
        'parchase_id',
        'med_id',
        'supplier_id',
        'type',
        'category_id',
        'quantity',
        'unit_price',
        'total_price',
        'exp_date',
    ];

    /**
     * ارتباط با خرید (Parchase)
     */
    public function parchase(): BelongsTo
    {
        return $this->belongsTo(
            Parchase::class,
            'parchase_id',
            'parchase_id'
        );
    }

    /**
     * ارتباط با دوا (Medication)
     */
    public function medication(): BelongsTo
    {
        return $this->belongsTo(
            Medication::class,
            'med_id',   // کلید خارجی در جدول parchaseitems
            'med_id'    // کلید اصلی در جدول medications
        );
    }

    /**
     * ارتباط با حمایت‌کننده (Supplier)
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(
            Supplier::class,
            'supplier_id',  // کلید خارجی در parchaseitems
            'supplier_id'   // کلید اصلی در suppliers
        );
    }

    /**
     * ارتباط با کتگوری (Category)
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(
            Category::class,
            'category_id', // کلید خارجی در parchaseitems
            'category_id'  // کلید اصلی در categories
        );
    }
}
