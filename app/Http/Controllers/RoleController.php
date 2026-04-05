<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use App\Services\LogService; // ✅ اضافه شد

class RoleController extends Controller
{
    // لیست رول‌ها همراه با پرمیشن‌ها
    public function index()
    {
        try {
            $roles = Role::with('permissions')->get();
            return response()->json($roles);
        } catch (\Exception $e) {
            return response()->json(['error' => 'خطا در دریافت لیست رول‌ها'], 500);
        }
    }

    // ایجاد رول جدید
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|unique:roles,name',
            ]);

            $role = Role::create([
                'name' => $request->name, 
                'guard_name' => 'web'
            ]);
            
            // پاک کردن کش
            app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

            // ✅ لاگ ایجاد
            LogService::create(
                'create',
                'roles',
                $role->id,
                'Role created',
                $role->toArray()
            );
            
            return response()->json([
                'message' => 'رول با موفقیت ایجاد شد',
                'role' => $role
            ], 201);
        } catch (ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'خطا در ایجاد رول جدید'], 500);
        }
    }

    // حذف رول
    public function destroy($id)
    {
        try {
            $role = Role::findOrFail($id);
            
            // بررسی اینکه رول به کاربری متصل نباشد
            $usersCount = \DB::table(config('permission.table_names.model_has_roles'))
                ->where('role_id', $id)
                ->count();
            
            if ($usersCount > 0) {
                return response()->json([
                    'error' => 'این رول به کاربرانی متصل است و قابل حذف نیست'
                ], 400);
            }
            
            // ✅ ذخیره اطلاعات قبل از حذف
            $data = $role->toArray();

            $role->delete();
            
            // پاک کردن کش
            app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

            // ✅ لاگ حذف
            LogService::create(
                'delete',
                'roles',
                $id,
                'Role deleted',
                $data
            );
            
            return response()->json([
                'message' => 'رول با موفقیت حذف شد'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'رول یافت نشد'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'خطا در حذف رول'], 500);
        }
    }

    // اختصاص پرمیشن به رول (بدون حذف پرمیشن‌های قبلی)
    public function assignPermissions(Request $request, $id)
    {
        try {
            $role = Role::findOrFail($id);
            
            // اعتبارسنجی ورودی
            $request->validate([
                'permissions' => 'required|array',
                'permissions.*' => 'exists:permissions,id'
            ]);
            
            $permissionIds = $request->permissions;
            $addedPermissions = [];
            
            // اضافه کردن پرمیشن‌های جدید (بدون حذف قبلی‌ها)
            foreach ($permissionIds as $permissionId) {
                if (!$role->hasPermissionTo($permissionId)) {
                    $role->givePermissionTo($permissionId);
                    $addedPermissions[] = $permissionId;
                }
            }
            
            // پاک کردن کش
            app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
            
            // ✅ لاگ اختصاص پرمیشن‌ها
            if (!empty($addedPermissions)) {
                $permissions = Permission::whereIn('id', $addedPermissions)->pluck('name')->toArray();
                LogService::create(
                    'assign',
                    'roles',
                    $role->id,
                    'Permissions assigned to role',
                    [
                        'role' => $role->toArray(),
                        'added_permissions' => $permissions,
                        'added_permission_ids' => $addedPermissions
                    ]
                );
            }
            
            // بازگردانی رول با پرمیشن‌های به‌روز شده
            $role->load('permissions');
            
            return response()->json([
                'message' => 'پرمیشن‌ها با موفقیت به رول اضافه شدند',
                'role' => $role
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'رول یافت نشد'], 404);
        } catch (ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'خطا در اختصاص پرمیشن‌ها: ' . $e->getMessage()], 500);
        }
    }

    // حذف یک پرمیشن خاص از رول
    public function removePermission($id, $permissionId)
    {
        try {
            $role = Role::findOrFail($id);
            $permission = Permission::findOrFail($permissionId);
            
            // ✅ ذخیره اطلاعات قبل از حذف
            $oldPermissions = $role->permissions()->pluck('name')->toArray();
            
            $role->revokePermissionTo($permission);
            
            // پاک کردن کش
            app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

            // ✅ لاگ حذف پرمیشن
            LogService::create(
                'remove',
                'roles',
                $role->id,
                'Permission removed from role',
                [
                    'role' => $role->toArray(),
                    'removed_permission' => $permission->toArray(),
                    'previous_permissions' => $oldPermissions,
                    'current_permissions' => $role->permissions()->pluck('name')->toArray()
                ]
            );
            
            return response()->json([
                'message' => 'پرمیشن با موفقیت از رول حذف شد'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'رول یا پرمیشن یافت نشد'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'خطا در حذف پرمیشن از رول'], 500);
        }
    }
}