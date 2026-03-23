<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * تعریف ثابت‌های نقش‌ها - هماهنگ با نام‌های موجود در Spatie
     */
    const ROLE_SUPER_ADMIN = 'super-admin';
    const ROLE_ADMIN = 'admin';
    const ROLE_HOSPITAL_HEAD = 'head-of-hospital';
    const ROLE_DOCTOR = 'doctor';
    const ROLE_PHARMACIST = 'pharmacist';
    const ROLE_NURSE = 'nurse';
    const ROLE_USER = 'user';
    const ROLE_EMPLOYEES = 'کارمندان';

    /**
     * Mass assignable attributes
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * Hidden attributes
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed', // مهم: اضافه کردن این خط
    ];

    // حذف یا کامنت کردن متد setPasswordAttribute
    // لاراول 11 به صورت خودکار پسورد را هش می‌کند
    // public function setPasswordAttribute($value)
    // {
    //     if ($value) {
    //         if (!str_starts_with($value, '$2y$')) {
    //             $this->attributes['password'] = Hash::make($value);
    //         } else {
    //             $this->attributes['password'] = $value;
    //         }
    //     }
    // }

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
            self::ROLE_EMPLOYEES => 'کارمندان',
        ];
    }

    /**
     * 🔹 دریافت عنوان فارسی نقش کاربر
     */
    public function getRoleNameAttribute(): string
    {
        if ($this->roles->isNotEmpty()) {
            $roleNames = $this->roles->pluck('name')->toArray();
            $persianRoles = [];
            foreach ($roleNames as $roleName) {
                $persianRoles[] = self::getRoles()[$roleName] ?? $roleName;
            }
            return implode('، ', $persianRoles);
        }
        
        return self::getRoles()[$this->role] ?? $this->role;
    }

    /**
     * 🔹 بررسی اینکه کاربر نقش مشخصی دارد یا خیر
     */
    public function hasRole($role): bool
    {
        if (is_array($role)) {
            return $this->roles()->whereIn('name', $role)->exists();
        }
        
        if ($this->roles()->where('name', $role)->exists()) {
            return true;
        }
        
        // Fallback به فیلد role قدیمی
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
        foreach ($roles as $role) {
            if ($this->hasRole($role)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 🔹 بررسی اینکه کاربر سوپر ادمین است
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole(self::ROLE_SUPER_ADMIN);
    }

    /**
     * 🔹 بررسی اینکه کاربر ادمین است (شامل سوپر ادمین هم می‌شود)
     */
    public function isAdmin(): bool
    {
        return $this->hasAnyRole([self::ROLE_SUPER_ADMIN, self::ROLE_ADMIN]);
    }

    /**
     * 🔹 بررسی اینکه کاربر رئیس شفاخانه است
     */
    public function isHospitalHead(): bool
    {
        return $this->hasRole(self::ROLE_HOSPITAL_HEAD);
    }

    /**
     * 🔹 بررسی اینکه کاربر داکتر است
     */
    public function isDoctor(): bool
    {
        return $this->hasRole(self::ROLE_DOCTOR);
    }

    /**
     * 🔹 بررسی اینکه کاربر مسئول دواخانه است
     */
    public function isPharmacist(): bool
    {
        return $this->hasRole(self::ROLE_PHARMACIST);
    }

    /**
     * 🔹 بررسی اینکه کاربر نرس است
     */
    public function isNurse(): bool
    {
        return $this->hasRole(self::ROLE_NURSE);
    }

    /**
     * 🔹 رابطه با نسخه‌ها
     */
    public function prescriptions()
    {
        return $this->hasMany(Prescription::class, 'doc_id', 'id');
    }

    /**
     * 🔹 رابطه با فروش‌ها
     */
    public function sales()
    {
        return $this->hasMany(Sale::class, 'created_by', 'id');
    }
}