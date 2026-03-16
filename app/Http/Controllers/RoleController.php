<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role; // استفاده از مدل سفارشی
use App\Models\Permission;

class RoleController extends Controller
{
    // لیست رول‌ها همراه با پرمیشن‌ها
    public function index()
    {
        $roles = Role::with('permissions')->get();
        return response()->json($roles);
    }

    // ایجاد رول جدید
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name',
        ]);

        $role = Role::create(['name' => $request->name, 'guard_name' => 'web']);
        return response()->json($role, 201);
    }

    // حذف رول
    public function destroy($id)
    {
        try {
            $role = Role::findOrFail($id);
            $role->delete();
            return response()->json(['message' => 'Role deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error deleting role'], 500);
        }
    }

    // اختصاص پرمیشن به رول
    public function assignPermissions(Request $request, $id)
    {
        try {
            $role = Role::findOrFail($id);

            // اگر پرمیشن‌ها موجود نیستند، آرایه خالی قرار می‌دهیم
            $permissionIds = $request->permissions ?? [];

            // دریافت پرمیشن‌های معتبر
            $validPermissions = Permission::whereIn('id', $permissionIds)->get();

            // همگام‌سازی پرمیشن‌ها
            $role->syncPermissions($validPermissions);

            return response()->json(['message' => 'Permissions assigned successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error assigning permissions'], 500);
        }
    }

    // حذف یک پرمیشن خاص از رول
    public function removePermission($id, $permissionId)
    {
        try {
            $role = Role::findOrFail($id);
            $permission = Permission::findOrFail($permissionId);
            
            $role->revokePermissionTo($permission);
            
            return response()->json(['message' => 'Permission removed from role successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error removing permission from role'], 500);
        }
    }
}