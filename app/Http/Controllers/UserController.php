<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(
            User::with('roles', 'permissions')->get()
        );
    }

    public function store(Request $request)
    {
        // اعتبارسنجی ساده (اختیاری اما توصیه می‌شود)
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role'     => 'required|exists:roles,name',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // تخصیص نقش با گارد تعریف‌شده در مدل (همان sanctum)
        $user->assignRole($request->role);

        return $user->load('roles', 'permissions');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:6',
            'role'     => 'nullable|exists:roles,name',
        ]);

        // به‌روزرسانی فیلدهای اصلی
        $user->fill($request->only(['name', 'email']));

        // اگر پسورد جدید ارسال شده باشد، هش و ذخیره کن
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        // به‌روزرسانی نقش (اگر مقدار role ارسال شده باشد)
        if ($request->has('role')) {
            $user->syncRoles([$request->role]);
        }

        // در صورت نیاز به همگام‌سازی پرمیشن‌ها
        if ($request->has('permissions')) {
            $user->syncPermissions($request->permissions);
        }

        return $user->load('roles', 'permissions');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'deleted']);
    }
}