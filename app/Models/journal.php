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
        'debit',
        'credit',
        'ref_type',
        'ref_id',
        'user_id',
    ];

    protected $casts = [
        'journal_date' => 'date',
        'debit'        => 'decimal:2',
        'credit'       => 'decimal:2',
    ];

    /**
     * انواع رویدادهای مالی (ref_type)
     */
    public const TYPES = [
        'sale',
        'purchase',
        'expense',
        'payment_in',
        'payment_out',
        'receivable',
        'payable',
        'cash_opening',
        'cash_adjustment',
        'refund_sale',
        'refund_purchase',
    ];

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
     * ارتباط چندمنظوره با رکورد اصلی (sale, purchase, expense, ...)
     */
    public function reference()
    {
        return $this->morphTo(null, 'ref_type', 'ref_id');
    }

    /* =========================
       Scopes (برای گزارش‌ها)
    ========================= */

    public function scopeDebit($query)
    {
        return $query->where('debit', '>', 0);
    }

    public function scopeCredit($query)
    {
        return $query->where('credit', '>', 0);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('ref_type', $type);
    }

    /* =========================
       Helpers
    ========================= */

    /**
     * بررسی صحت ثبت (یکی از debit یا credit)
     */
    public function isValid(): bool
    {
        return ($this->debit > 0 && $this->credit == 0)
            || ($this->credit > 0 && $this->debit == 0);
    }

    /**
     * محاسبه مانده رکورد
     */
    public function getBalanceAttribute()
    {
        return $this->credit - $this->debit;
    }
}
