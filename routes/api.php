<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MedicationController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\HospitalReportController;
use App\Http\Controllers\PrescriptionController;

/*
|--------------------------------------------------------------------------
| Public Routes (API - SANCTUM TOKEN)
|--------------------------------------------------------------------------
*/

// این دو route برای تست بدون احراز هویت
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// اضافه کردن route برای csrf-cookie (در صورت نیاز)
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
});

Route::get('/sales-view', [SalesController::class, 'view']);
Route::get('/sales/chart', [SalesController::class, 'chart']);

/*
|--------------------------------------------------------------------------
| Protected Routes (SANCTUM TOKEN ONLY)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // USERS
    Route::get('/users', [UserController::class, 'index'])->middleware('permission:view-users');
    Route::post('/users', [UserController::class, 'store'])->middleware('permission:create-users');
    Route::get('/users/{user}', [UserController::class, 'show'])->middleware('permission:view-users');
    Route::put('/users/{user}', [UserController::class, 'update'])->middleware('permission:edit-users');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('permission:delete-users');

    // ROLES
    Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:view-roles');
    Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:create-roles');
    Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->middleware('permission:delete-roles');

    Route::post('/roles/{id}/permissions', [RoleController::class, 'assignPermissions'])->middleware('permission:assign-permissions');
    Route::delete('/roles/{id}/permissions/{permissionId}', [RoleController::class, 'removePermission'])->middleware('permission:edit-roles');

    // PERMISSIONS
    Route::get('/permissions', [PermissionController::class, 'index'])->middleware('permission:view-permissions');
    Route::post('/permissions', [PermissionController::class, 'store'])->middleware('permission:create-permissions');
    Route::delete('/permissions/{id}', [PermissionController::class, 'destroy'])->middleware('permission:delete-permissions');

    // DASHBOARD
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('permission:view-dashboard');

    // MEDICATIONS
    Route::get('/medications', [MedicationController::class, 'index'])->middleware('permission:view-medications');
    Route::post('/medications', [MedicationController::class, 'store'])->middleware('permission:create-medications');
    Route::put('/medications/{med_id}', [MedicationController::class, 'update'])->middleware('permission:edit-medications');
    Route::delete('/medications/{med_id}', [MedicationController::class, 'destroy'])->middleware('permission:delete-medications');

    // PRESCRIPTIONS
    Route::get('/prescriptions', [PrescriptionController::class, 'index'])->middleware('permission:view-prescriptions');
    Route::post('/prescriptions', [PrescriptionController::class, 'store'])->middleware('permission:create-prescriptions');
    Route::put('/prescriptions/{pres_id}', [PrescriptionController::class, 'update'])->middleware('permission:edit-prescriptions');
    Route::delete('/prescriptions/{pres_id}', [PrescriptionController::class, 'destroy'])->middleware('permission:delete-prescriptions');

    // SALES
    Route::get('/sales', [SalesController::class, 'index'])->middleware('permission:view-sales');
    Route::post('/sales', [SalesController::class, 'store'])->middleware('permission:create-sales');
    Route::put('/sales/{sales_id}', [SalesController::class, 'update'])->middleware('permission:edit-sales');
    Route::delete('/sales/{sales_id}', [SalesController::class, 'destroy'])->middleware('permission:delete-sales');

    // INVENTORY
    Route::get('/inventory', [InventoryController::class, 'index'])->middleware('permission:view-inventory');
    Route::post('/inventory', [InventoryController::class, 'store'])->middleware('permission:create-inventory');

    // REPORTS
    Route::get('/hospital-reports', [HospitalReportController::class, 'index'])->middleware('permission:view-reports');

});