<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // ✅ این خط حتماً باید باشد
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles; // ✅ HasApiTokens اینجا اضافه شود

    protected $guard_name = 'web';

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

    const ROLE_SUPER_ADMIN = 'super-admin';
    const ROLE_ADMIN = 'admin';
    const ROLE_HOSPITAL_HEAD = 'head-of-hospital';
    const ROLE_DOCTOR = 'doctor';
    const ROLE_PHARMACIST = 'pharmacist';
    const ROLE_NURSE = 'nurse';
    const ROLE_USER = 'user';
    const ROLE_EMPLOYEES = 'employees';

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

    public function getRoleNameAttribute(): string
    {
        if ($this->roles->isNotEmpty()) {
            return $this->roles->pluck('name')->join('، ');
        }

        return 'بدون نقش';
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class, 'doc_id', 'id');
    }

    public function sales()
    {
        return $this->hasMany(Sales::class, 'created_by', 'id');
    }
}