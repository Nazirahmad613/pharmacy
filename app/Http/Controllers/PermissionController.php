<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permission; // استفاده از مدل سفارشی

class PermissionController extends Controller
{
    // لیست پرمیشن‌ها
    public function index()
    {
        $permissions = Permission::all();
        return response()->json($permissions);
    }

    // ایجاد پرمیشن جدید
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:permissions,name',
        ]);

        $permission = Permission::create(['name' => $request->name, 'guard_name' => 'web']);
        return response()->json($permission, 201);
    }

    // حذف پرمیشن
    public function destroy($id)
    {
        try {
            $permission = Permission::findOrFail($id);
            $permission->delete();
            return response()->json(['message' => 'Permission deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error deleting permission'], 500);
        }
    }
}