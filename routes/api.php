<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ==================== Controllers ====================
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MedicationController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\CustomersController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\SalesDetailsController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ViewInventoryController;
use App\Http\Controllers\ViewMedicationsController;
use App\Http\Controllers\ViewProfitLossController;
use App\Http\Controllers\ViewSupplierPurchasesController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\StockReportController;
use App\Http\Controllers\ParchasesController;
use App\Http\Controllers\SalesFullDetailsController;
use App\Http\Controllers\RegistrationsController;
use App\Http\Controllers\JournalController;
use App\Http\Controllers\HospitalReportController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\AccountSummaryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DepartementController; // ✅ فقط یک Controller

/*
|--------------------------------------------------------------------------
| API Test
|--------------------------------------------------------------------------
*/
Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

/*
|--------------------------------------------------------------------------
| Authentication (PUBLIC)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ===== Departments بدون توکن (برای React select) =====


/*
|--------------------------------------------------------------------------
| Protected Routes (Token-based)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::apiResource('users', UserController::class);

    // ===== Auth =====
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);


     Route::get('/departments', [DepartementController::class, 'index']);

    // ===== Registrations =====
    Route::post('/registrations', [RegistrationsController::class, 'store']);
    Route::get('/registrations', [RegistrationsController::class, 'index']);

    // ===== Dashboard =====
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ===== Suppliers =====
    Route::get('/suppliers', [SupplierController::class, 'index']);
    Route::post('/suppliers', [SupplierController::class, 'store']);

    // ===== Medications =====
    Route::get('/medications', [MedicationController::class, 'index']);
    Route::post('/medications', [MedicationController::class, 'store']);

    // ===== Doctors =====
    Route::get('/doctors', [DoctorController::class, 'index']);
    Route::post('/doctors', [DoctorController::class, 'store']);

    // ===== Prescriptions =====
    Route::get('/prescriptions', [PrescriptionController::class, 'index']);
    Route::post('/prescriptions', [PrescriptionController::class, 'store']);

    // ===== Stock & Sales =====
    Route::get('/stock', [StockReportController::class, 'index']);
    Route::get('/salesd', [SalesFullDetailsController::class, 'index']);

    // ===== Suppliers by Medication =====
    Route::get('/suppliers/by-medication/{med_id}', [SupplierController::class, 'suppliersByMedication']);

    // ===== Inventory =====
    Route::get('/inventory', [InventoryController::class, 'index']);
    Route::post('/inventory', [InventoryController::class, 'store']);

    // ===== Sales =====
    Route::get('/sales', [SalesController::class, 'index']);
    Route::post('/sales', [SalesController::class, 'store']);

    // ===== Sales Details =====
    Route::get('/sales-details', [SalesDetailsController::class, 'index']);

    // ===== Customers =====
    Route::get('/customers', [CustomersController::class, 'index']);

    // ===== Categories =====
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);

    // ===== Purchases =====
    Route::get('/parchases', [ParchasesController::class, 'index']);
    Route::post('/parchases', [ParchasesController::class, 'store']);

    // ===== Notifications =====
    Route::get('/notifications', [NotificationController::class, 'index']);


// لیست دواها
Route::get('/medications', [MedicationController::class, 'index']);

// ثبت دوا
Route::post('/medications', [MedicationController::class, 'store']);

// نمایش یک دوا
Route::get('/medications/{med_id}', [MedicationController::class, 'show']);

// ✏️ تصحیح دوا
Route::put('/medications/{med_id}', [MedicationController::class, 'update']);

// ❌ حذف دوا
Route::delete('/medications/{med_id}', [MedicationController::class, 'destroy']);






    // ===== Journals =====
    Route::get('/journals', [JournalController::class, 'index']);
    Route::get('/journals/{id}', [JournalController::class, 'show']);
    Route::post('/journals', [JournalController::class, 'store']);
    Route::put('/journals/{id}', [JournalController::class, 'update']);
    Route::delete('/journals/{id}', [JournalController::class, 'destroy']);

Route::put('/registrations/{reg_id}', [RegistrationsController::class, 'update']);
Route::delete('/registrations/{reg_id}', [RegistrationsController::class, 'destroy']);





    // ===== Reports / Views =====
    Route::get('/view-inventory', [ViewInventoryController::class, 'index']);
    Route::get('/view-medications', [ViewMedicationsController::class, 'index']);
    Route::get('/account-summary', [AccountSummaryController::class, 'index']);
    Route::get('/view-profit-loss', [ViewProfitLossController::class, 'index']);
    Route::get('/view-supplier-purchases', [ViewSupplierPurchasesController::class, 'index']);
    Route::get('/hospital-reports', [HospitalReportController::class, 'index']);
});