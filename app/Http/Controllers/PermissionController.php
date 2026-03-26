<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permission;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use App\Services\LogService; // ✅ اضافه شد

class PermissionController extends Controller
{
    // لیست پرمیشن‌ها
    public function index()
    {
        try {
            $permissions = Permission::all();
            return response()->json($permissions);
        } catch (\Exception $e) {
            return response()->json(['error' => 'خطا در دریافت لیست پرمیشن‌ها: ' . $e->getMessage()], 500);
        }
    }

    // ایجاد پرمیشن جدید
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|unique:permissions,name',
            ]);

            $permission = Permission::create([
                'name' => $request->name, 
                'guard_name' => 'web'
            ]);
            
            // ✅ لاگ ایجاد
            LogService::create(
                'create',
                'permissions',
                $permission->id,
                'Permission created',
                $permission->toArray()
            );

            return response()->json([
                'message' => 'پرمیشن با موفقیت ایجاد شد',
                'permission' => $permission
            ], 201);
        } catch (ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'خطا در ایجاد پرمیشن جدید: ' . $e->getMessage()], 500);
        }
    }

    // حذف پرمیشن
    public function destroy($id)
    {
        try {
            // یافتن پرمیشن
            $permission = Permission::findOrFail($id);
            
            // روش اول: استفاده از Query Builder برای بررسی وجود رابطه
            $rolesCount = \DB::table(config('permission.table_names.role_has_permissions'))
                ->where('permission_id', $id)
                ->count();
            
            if ($rolesCount > 0) {
                // دریافت نام رول‌هایی که از این پرمیشن استفاده می‌کنند
                $roles = \DB::table(config('permission.table_names.role_has_permissions'))
                    ->join(config('permission.table_names.roles'), config('permission.table_names.role_has_permissions') . '.role_id', '=', config('permission.table_names.roles') . '.id')
                    ->where(config('permission.table_names.role_has_permissions') . '.permission_id', $id)
                    ->pluck(config('permission.table_names.roles') . '.name')
                    ->toArray();
                
                $rolesList = implode('، ', $roles);
                
                return response()->json([
                    'error' => "این پرمیشن به رول‌های زیر متصل است و قابل حذف نیست: {$rolesList}"
                ], 400);
            }
            
            // ✅ ذخیره اطلاعات قبل از حذف
            $data = $permission->toArray();

            // حذف پرمیشن
            $permission->delete();
            
            // پاک کردن کش
            app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

            // ✅ لاگ حذف
            LogService::create(
                'delete',
                'permissions',
                $id,
                'Permission deleted',
                $data
            );
            
            return response()->json([
                'message' => 'پرمیشن با موفقیت حذف شد'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'پرمیشن یافت نشد'], 404);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'خطا در حذف پرمیشن: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    // روش جایگزین برای حذف پرمیشن (اگر روش بالا کار نکرد)
    public function destroyAlternative($id)
    {
        try {
            // یافتن پرمیشن
            $permission = Permission::findOrFail($id);
            
            // روش دوم: استفاده از مدل Role برای بررسی
            $roles = \App\Models\Role::whereHas('permissions', function($query) use ($id) {
                $query->where('id', $id);
            })->get();
            
            if ($roles->count() > 0) {
                $rolesList = $roles->pluck('name')->implode('، ');
                
                return response()->json([
                    'error' => "این پرمیشن به رول‌های زیر متصل است و قابل حذف نیست: {$rolesList}"
                ], 400);
            }
            
            // ✅ ذخیره اطلاعات قبل از حذف
            $data = $permission->toArray();

            // حذف پرمیشن
            $permission->delete();
            
            // پاک کردن کش
            app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

            // ✅ لاگ حذف
            LogService::create(
                'delete',
                'permissions',
                $id,
                'Permission deleted',
                $data
            );
            
            return response()->json([
                'message' => 'پرمیشن با موفقیت حذف شد'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'پرمیشن یافت نشد'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'خطا در حذف پرمیشن: ' . $e->getMessage()], 500);
        }
    }
}