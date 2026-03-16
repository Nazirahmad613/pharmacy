<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // پاک کردن رول‌ها و پرمیشن‌ها برای جلوگیری از تکرار
        Permission::truncate();
        Role::truncate();

        // پرمیشن‌ها
        $permissions = [
            'create_patient', 'edit_patient', 'delete_patient', 'view_patient',
            'create_prescription', 'edit_prescription', 'delete_prescription', 'view_prescription',
            'create_sale', 'edit_sale', 'delete_sale', 'view_sale'
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // رول‌ها
        $superAdmin = Role::create(['name' => 'super-admin']);
        $admin = Role::create(['name' => 'admin']);
        $head = Role::create(['name' => 'head-of-hospital']);
        $user = Role::create(['name' => 'user']);

        // اتصال پرمیشن‌ها به رول‌ها
        $superAdmin->givePermissionTo(Permission::all());
        $admin->givePermissionTo(['create_patient','edit_patient','view_patient']);
        $head->givePermissionTo(['view_patient','create_prescription','edit_prescription']);
        $user->givePermissionTo(['view_patient','view_prescription']);
    }
}