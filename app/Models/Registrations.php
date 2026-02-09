<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Journal;

class Registrations extends Model
{
    use HasFactory;

    protected $table = 'registrations';
    protected $primaryKey = 'reg_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'reg_type',
        'full_name',
        'father_name',
        'phone',
        'gender',
        'age',
        'blood_group',
        'address',
        'visit_date',
        'note',
        'status',
    ];

    /* =========================
       Relationships
    ========================= */

    /**
     * ارتباط با ژورنال‌ها
     * (بر اساس reg_type + reg_id)
     */
    public function journals()
    {
        return $this->hasMany(
            Journal::class,
            'ref_id',
            'reg_id'
        )->whereColumn(
            'journals.ref_type',
            'registrations.reg_type'
        );
    }

    /* =========================
       Accessors (برای نمایش)
    ========================= */

    /**
     * نام نمایشی واحد برای ژورنال و Select ها
     */
    public function getRegNameAttribute(): string
    {
        return trim(
            $this->full_name .
            ($this->father_name ? ' / ' . $this->father_name : '')
        );
    }

    /* =========================
       Scopes (اختیاری ولی مفید)
    ========================= */

    public function scopeByType($query, string $type)
    {
        return $query->where('reg_type', $type);
    }
}
