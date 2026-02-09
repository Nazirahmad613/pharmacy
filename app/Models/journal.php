<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Journal extends Model
{
    use HasFactory;

    protected $table = 'journals';

    protected $fillable = [
        'journal_date',
        'description',
        'entry_type',   // debit | credit
        'amount',
        'ref_type',     // doctor, patient, sale, ...
        'ref_id',       // registrations.reg_id
        'user_id',
    ];

    protected $casts = [
        'journal_date' => 'date',
        'amount'       => 'decimal:2',
    ];

    /* =========================
       Constants
    ========================= */

    public const ENTRY_DEBIT  = 'debit';
    public const ENTRY_CREDIT = 'credit';

    /* =========================
       Relationships
    ========================= */

    /**
     * کاربر ثبت‌کننده ژورنال
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * ارتباط ساده با جدول registrations
     * شرط ref_type = reg_type در Controller بررسی شود
     */
 public function registration()
{
    return $this->belongsTo(
        Registrations::class,
        'ref_id',
        'reg_id'
    );
}


    /* =========================
       Scopes (گزارش‌گیری)
    ========================= */

    public function scopeDebit($query)
    {
        return $query->where('entry_type', self::ENTRY_DEBIT);
    }

    public function scopeCredit($query)
    {
        return $query->where('entry_type', self::ENTRY_CREDIT);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('ref_type', $type);
    }

    /* =========================
       Helpers
    ========================= */

    /**
     * بررسی صحت رکورد
     */
    public function isValid(): bool
    {
        return in_array($this->entry_type, [
            self::ENTRY_DEBIT,
            self::ENTRY_CREDIT
        ]) && $this->amount > 0;
    }

    /**
     * مانده حساب (حسابداری استاندارد)
     */
    public function getBalanceAttribute(): float
    {
        return $this->entry_type === self::ENTRY_CREDIT
            ? $this->amount
            : -$this->amount;
    }

    /**
     * نام رویداد (برای نمایش، بدون ذخیره)
     */
    public function getRefNameAttribute(): ?string
    {
        return $this->registration?->reg_name;
    }
}
