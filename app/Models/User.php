<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * تعریف ثابت‌های نقش‌ها
     */
    const ROLE_SUPER_ADMIN = 'super_admin';
    const ROLE_ADMIN = 'admin';
    const ROLE_HOSPITAL_HEAD = 'hospital_head';
    const ROLE_DOCTOR = 'doctor';
    const ROLE_PHARMACIST = 'pharmacist';
    const ROLE_NURSE = 'nurse';
    const ROLE_USER = 'user';

    /**
     * Mass assignable attributes
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // اضافه شد
    ];

    /**
     * Hidden attributes
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Mutator: وقتی پسورد ست می‌شود، خودکار هش شود
     */
    public function setPasswordAttribute($value)
    {
        if ($value) {
            // اگر قبلاً هش نشده باشد، هش کن
            if (!str_starts_with($value, '$2y$')) {
                $this->attributes['password'] = Hash::make($value);
            } else {
                $this->attributes['password'] = $value;
            }
        }
    }

    /**
     * 🔹 دریافت لیست تمام نقش‌ها با عنوان فارسی
     */
    public static function getRoles(): array
    {
        return [
            self::ROLE_SUPER_ADMIN => 'سوپر ادمین',
            self::ROLE_ADMIN => 'ادمین',
            self::ROLE_HOSPITAL_HEAD => 'رئیس عمومی شفاخانه',
            self::ROLE_DOCTOR => 'داکتر',
            self::ROLE_PHARMACIST => 'مسئول دواخانه',
            self::ROLE_NURSE => 'نرس',
            self::ROLE_USER => 'کاربر عادی',
        ];
    }

    /**
     * 🔹 دریافت عنوان فارسی نقش کاربر
     */
    public function getRoleNameAttribute(): string
    {
        return self::getRoles()[$this->role] ?? $this->role;
    }

    /**
     * 🔹 بررسی اینکه کاربر نقش مشخصی دارد یا خیر
     */
    public function hasRole($role): bool
    {
        if (is_array($role)) {
            return in_array($this->role, $role);
        }
        return $this->role === $role;
    }

    /**
     * 🔹 بررسی اینکه کاربر حداقل یکی از نقش‌های مشخص شده را دارد
     */
    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    /**
     * 🔹 بررسی اینکه کاربر سوپر ادمین است
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    /**
     * 🔹 بررسی اینکه کاربر ادمین است (شامل سوپر ادمین هم می‌شود)
     */
    public function isAdmin(): bool
    {
        return in_array($this->role, [self::ROLE_SUPER_ADMIN, self::ROLE_ADMIN]);
    }

    /**
     * 🔹 بررسی اینکه کاربر رئیس شفاخانه است
     */
    public function isHospitalHead(): bool
    {
        return $this->role === self::ROLE_HOSPITAL_HEAD;
    }

    /**
     * 🔹 بررسی اینکه کاربر داکتر است
     */
    public function isDoctor(): bool
    {
        return $this->role === self::ROLE_DOCTOR;
    }

    /**
     * 🔹 بررسی اینکه کاربر مسئول دواخانه است
     */
    public function isPharmacist(): bool
    {
        return $this->role === self::ROLE_PHARMACIST;
    }

    /**
     * 🔹 بررسی اینکه کاربر نرس است
     */
    public function isNurse(): bool
    {
        return $this->role === self::ROLE_NURSE;
    }

    /**
     * 🔹 متد کمکی برای هش کردن تمام پسوردهای قبلی
     */
    public static function hashOldPasswords()
    {
        $users = self::all();
        foreach ($users as $user) {
            if (!str_starts_with($user->password, '$2y$')) {
                $user->password = $user->password; // با Mutator هش می‌شود
                $user->save();
            }
        }
    }

    /**
     * 🔹 رابطه با نسخه‌ها (اگر کاربر داکتر باشد)
     */
    public function prescriptions()
    {
        return $this->hasMany(Prescription::class, 'doc_id', 'id');
    }

    /**
     * 🔹 رابطه با فروش‌ها (اگر کاربر مسئول دواخانه باشد)
     */
    public function sales()
    {
        return $this->hasMany(Sale::class, 'created_by', 'id');
    }
}