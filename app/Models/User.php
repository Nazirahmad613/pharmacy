<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
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
        'password' => 'hashed', // لاراول 11 به صورت خودکار پسورد را هش می‌کند
    ];

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