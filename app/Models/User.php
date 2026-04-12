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

    protected $guard_name = 'sanctum';

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $casts = [
        'password' => 'hashed',
    ];
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
   
 
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
        return $this->roles->pluck('name')->join('، ');
    }

    return 'بدون نقش';
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