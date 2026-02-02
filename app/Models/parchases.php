<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\ParchaseItem;

class Parchases extends Model
{
    use HasFactory;

    protected $primaryKey = 'parchase_id';

    protected $fillable = [
        'parchase_date',
        'total_parchase',
        'par_paid',
        'due_par',
        'purpose',      // نوع خرید: دارو / غیر دارو
        'description',  // توضیح خرید غیر دارو
        'par_user',     // کاربر ثبت‌کننده
    ];

    /**
     * رابطه با آیتم‌های خرید
     */
    public function items(): HasMany
    {
        return $this->hasMany(ParchaseItem::class, 'parchase_id', 'parchase_id');
    }

    /**
     * بدهی مانده
     */
    public function getRemainingAttribute(): float
    {
        return $this->total_parchase - $this->par_paid;
    }
}
