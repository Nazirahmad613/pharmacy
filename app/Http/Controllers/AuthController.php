<?php

namespace App\Http\Controllers;
 

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // ثبت‌نام کاربر
    public function register(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6'
        ]);

        $user = User::create([
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']), // ✅ bcrypt صحیح
        ]);

        // لاگین کاربر بعد از ثبت‌نام
        Auth::login($user);

        // ایجاد Personal Access Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
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

        // 🔴 بررسی bcrypt
        if (!Auth::attempt($validated)) {
            return response()->json([
                'message' => 'ایمیل یا رمز عبور اشتباه است'
            ], 401);
        }

        $user = Auth::user();

        // ایجاد Personal Access Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 200);
    }

    // لاگ‌اوت
    public function logout(Request $request)
    {
        // حذف تمام توکن‌های کاربر
        $user = Auth::user();
        if ($user) {
            $user->tokens()->delete();
        }

        Auth::logout();

        return response()->json([
            'message' => 'با موفقیت خارج شدید'
        ], 200);
    }

    // اطلاعات کاربر لاگین شده
    public function me(Request $request)
    {
        return response()->json([
            'user' => Auth::user()
        ], 200);
    }
}
