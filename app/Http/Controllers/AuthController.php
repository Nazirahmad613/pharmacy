<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // ثبت‌نام کاربر
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => 'sometimes|in:' . implode(',', array_keys(User::getRoles())),
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'], // ✅ Mutator در مدل هش می‌کند
            'role' => $validated['role'] ?? User::ROLE_USER, // نقش پیش‌فرض کاربر عادی
        ]);

        // ایجاد Personal Access Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'ثبت‌نام با موفقیت انجام شد',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'role_name' => $user->role_name,
            ],
            'token' => $token
        ], 201);
    }

    // لاگین کاربر (API-safe)
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // بررسی اعتبارسنجی
        if (!Auth::attempt($validated)) {
            throw ValidationException::withMessages([
                'email' => ['ایمیل یا رمز عبور اشتباه است'],
            ]);
        }

        $user = Auth::user();

        // حذف توکن‌های قبلی (اختیاری - اگر می‌خواهید هر بار توکن جدید بگیرد)
        // $user->tokens()->delete();

        // ایجاد Personal Access Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'ورود با موفقیت انجام شد',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'role_name' => $user->role_name,
            ],
            'token' => $token
        ], 200);
    }

    // لاگ‌اوت
    public function logout(Request $request)
    {
        // حذف توکن فعلی کاربر
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'با موفقیت خارج شدید'
        ], 200);
    }

    // اطلاعات کاربر لاگین شده + دسترسی‌ها
    public function me(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'role_name' => $user->role_name,
            ],
            'permissions' => $this->getUserPermissions($user),
        ], 200);
    }

    // دریافت دسترسی‌های کاربر بر اساس نقش
    private function getUserPermissions($user)
    {
        return [
            'users' => [
                'view' => $user->isAdmin(),
                'create' => $user->isAdmin(),
                'edit' => $user->isAdmin(),
                'delete' => $user->isSuperAdmin(),
            ],
            'medications' => [
                'view' => true,
                'create' => $user->isAdmin() || $user->isPharmacist(),
                'edit' => $user->isAdmin() || $user->isPharmacist(),
                'delete' => $user->isAdmin(),
            ],
            'reports' => [
                'view' => true,
                'export' => $user->isAdmin() || $user->isHospitalHead(),
            ],
            'prescriptions' => [
                'view' => true,
                'create' => $user->isDoctor() || $user->isAdmin(),
                'edit' => $user->isDoctor() || $user->isAdmin(),
                'delete' => $user->isAdmin(),
            ],
            'sales' => [
                'view' => true,
                'create' => $user->isPharmacist() || $user->isAdmin(),
                'edit' => $user->isAdmin(),
                'delete' => $user->isAdmin(),
            ],
            'dashboard' => [
                'view' => true,
                'analytics' => $user->isAdmin() || $user->isHospitalHead(),
            ],
        ];
    }

    // دریافت لیست نقش‌ها
    public function getRoles()
    {
        return response()->json([
            'success' => true,
            'roles' => User::getRoles(),
        ]);
    }

    // تغییر رمز عبور
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'رمز عبور فعلی اشتباه است'
            ], 400);
        }

        $user->password = $request->new_password;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'رمز عبور با موفقیت تغییر کرد'
        ]);
    }

    // بروزرسانی پروفایل
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
        ]);

        $user->update($request->only(['name', 'email']));

        return response()->json([
            'success' => true,
            'message' => 'پروفایل با موفقیت بروزرسانی شد',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'role_name' => $user->role_name,
            ]
        ]);
    }
}