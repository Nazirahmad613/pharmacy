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
     * Mass assignable attributes
     */
    protected $fillable = [
        'name',
        'email',
        'password',
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
}
