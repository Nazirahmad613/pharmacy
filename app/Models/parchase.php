<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Parchase extends Model
{
    use HasFactory;

    protected $primaryKey = 'parchase_id';

    protected $fillable = [
        'parchase_date',
        'total_parchase',
        'par_paid',
        'due_par',
        'par_user',     // کاربر ثبت‌کننده
        'supplier_id',  // حمایت‌کننده
    ];

    /**
     * رابطه با آیتم‌های خرید
     */
    public function items(): HasMany
    {
        return $this->hasMany(ParchaseItem::class, 'parchase_id', 'parchase_id');
    }

    /**
     * رابطه با حمایت‌کننده مستقیم
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Registrations::class, 'supplier_id', 'reg_id');
    }

    /**
     * بدهی مانده
     */
    public function getRemainingAttribute(): float
    {
        return $this->total_parchase - $this->par_paid;
    }
}
