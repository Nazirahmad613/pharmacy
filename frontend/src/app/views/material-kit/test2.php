<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// ==================== Controllers ====================
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LogController;
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
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\DepartementController;
use App\Http\Controllers\BenefitController;

/*
|--------------------------------------------------------------------------
| Authentication (PUBLIC)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/sales-view', [SalesController::class, 'view']);
Route::get('/sales/chart', [SalesController::class, 'chart']);
 
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ================= USERS =================
    Route::get('/users', [UserController::class, 'index'])->middleware('permission:view-users');
    Route::post('/users', [UserController::class, 'store'])->middleware('permission:create-users');
    Route::get('/users/{user}', [UserController::class, 'show'])->middleware('permission:view-users');
    Route::put('/users/{user}', [UserController::class, 'update'])->middleware('permission:edit-users');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('permission:delete-users');

    // ================= LOGS =================
    Route::get('/logs', [LogController::class, 'index'])->middleware('permission:view-logs');

    // ================= ROLES =================
    Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:view-roles');
    Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:create-roles');
    Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->middleware('permission:delete-roles');

    Route::post('/roles/{id}/permissions', [RoleController::class, 'assignPermissions'])->middleware('permission:assign-permissions');
    Route::delete('/roles/{id}/permissions/{permissionId}', [RoleController::class, 'removePermission'])->middleware('permission:edit-roles');

    // ================= PERMISSIONS =================
    Route::get('/permissions', [PermissionController::class, 'index'])->middleware('permission:view-permissions');
    Route::post('/permissions', [PermissionController::class, 'store'])->middleware('permission:create-permissions');
    Route::delete('/permissions/{id}', [PermissionController::class, 'destroy'])->middleware('permission:delete-permissions');

    // ================= DEPARTMENTS =================
    Route::get('/departments', [DepartementController::class, 'index'])->middleware('permission:view-departments');

    // ================= REGISTRATIONS =================
    Route::get('/registrations', [RegistrationsController::class, 'index'])->middleware('permission:view-registrations');
    Route::post('/registrations', [RegistrationsController::class, 'store'])->middleware('permission:create-registrations');
    Route::put('/registrations/{reg_id}', [RegistrationsController::class, 'update'])->middleware('permission:edit-registrations');
    Route::delete('/registrations/{reg_id}', [RegistrationsController::class, 'destroy'])->middleware('permission:delete-registrations');

    // ================= DASHBOARD =================
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('permission:view-dashboard');

    // ================= SUPPLIERS =================
    Route::get('/suppliers', [SupplierController::class, 'index'])->middleware('permission:view-suppliers');
    Route::post('/suppliers', [SupplierController::class, 'store'])->middleware('permission:create-suppliers');

    // ================= MEDICATIONS =================
    Route::get('/medications', [MedicationController::class, 'index'])->middleware('permission:view-medications');
    Route::post('/medications', [MedicationController::class, 'store'])->middleware('permission:create-medications');
    Route::get('/medications/{med_id}', [MedicationController::class, 'show'])->middleware('permission:view-medications');
    Route::put('/medications/{med_id}', [MedicationController::class, 'update'])->middleware('permission:edit-medications');
    Route::delete('/medications/{med_id}', [MedicationController::class, 'destroy'])->middleware('permission:delete-medications');

    // ================= DOCTORS =================
    Route::get('/doctors', [DoctorController::class, 'index'])->middleware('permission:view-doctors');
    Route::post('/doctors', [DoctorController::class, 'store'])->middleware('permission:create-doctors');

    // ================= PRESCRIPTIONS =================
    Route::get('/prescriptions', [PrescriptionController::class, 'index'])->middleware('permission:view-prescriptions');
    Route::post('/prescriptions', [PrescriptionController::class, 'store'])->middleware('permission:create-prescriptions');
    Route::put('/prescriptions/{pres_id}', [PrescriptionController::class, 'update'])->middleware('permission:edit-prescriptions');
    Route::delete('/prescriptions/{pres_id}', [PrescriptionController::class, 'destroy'])->middleware('permission:delete-prescriptions');

    // ================= STOCK / SALES =================
    Route::get('/stock', [StockReportController::class, 'index'])->middleware('permission:view-stock');
    Route::get('/sales', [SalesController::class, 'index'])->middleware('permission:view-sales');
    Route::post('/sales', [SalesController::class, 'store'])->middleware('permission:create-sales');
    Route::put('/sales/{sales_id}', [SalesController::class, 'update'])->middleware('permission:edit-sales');
    Route::delete('/sales/{sales_id}', [SalesController::class, 'destroy'])->middleware('permission:delete-sales');

    Route::get('/salesd', [SalesFullDetailsController::class, 'index'])->middleware('permission:view-sales');

    // ================= INVENTORY =================
    Route::get('/inventory', [InventoryController::class, 'index'])->middleware('permission:view-inventory');
    Route::post('/inventory', [InventoryController::class, 'store'])->middleware('permission:create-inventory');

    // ================= SALES DETAILS =================
    Route::get('/sales-details', [SalesDetailsController::class, 'index'])->middleware('permission:view-sales');

    // ================= CUSTOMERS =================
    Route::get('/customers', [CustomersController::class, 'index'])->middleware('permission:view-customers');

    // ================= CATEGORIES =================
    Route::get('/categories', [CategoryController::class, 'index'])->middleware('permission:view-categories');
    Route::post('/categories', [CategoryController::class, 'store'])->middleware('permission:create-categories');
    Route::put('/categories/{id}', [CategoryController::class, 'update'])->middleware('permission:edit-categories');
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->middleware('permission:delete-categories');

    // ================= PURCHASES =================
    Route::prefix('parchases')->group(function () {
        Route::get('/', [ParchasesController::class, 'index'])->middleware('permission:view-purchases');
        Route::post('/', [ParchasesController::class, 'store'])->middleware('permission:create-purchases');
        Route::put('/{parchaseid}', [ParchasesController::class, 'update'])->middleware('permission:edit-purchases');
        Route::delete('/{parchaseid}', [ParchasesController::class, 'destroy'])->middleware('permission:delete-purchases');
    });

    // ================= REPORTS =================
    Route::get('/hospital-reports', [HospitalReportController::class, 'index'])->middleware('permission:view-reports');
    Route::get('/account-summary', [AccountSummaryController::class, 'index'])->middleware('permission:view-reports');
    Route::get('/view-profit-loss', [ViewProfitLossController::class, 'index'])->middleware('permission:view-reports');
    Route::get('/view-inventory', [ViewInventoryController::class, 'index'])->middleware('permission:view-reports');
    Route::get('/view-medications', [ViewMedicationsController::class, 'index'])->middleware('permission:view-reports');
    Route::get('/view-supplier-purchases', [ViewSupplierPurchasesController::class, 'index'])->middleware('permission:view-reports');

    Route::get('/reports/medication-stock', function () {
        return DB::table('vw_medication_status')->get();
    })->middleware('permission:view-reports');

    Route::get('/dashboard-daily', function () {
        return DB::table('view_dashboard_daily')->get();
    })->middleware('permission:view-dashboard');

    Route::get('/benefits', [BenefitController::class, 'index'])->middleware('permission:view-benefits');
});

/*
|--------------------------------------------------------------------------
| Public Reports
|--------------------------------------------------------------------------
*/
Route::get('/sales-report', function (Request $request) {
    $type = $request->get('type', 'daily');

    $query = DB::table('view_sales_summary');

    if ($type) {
        $query->where('report_type', $type);
    }

    return $query->get();
});

Route::get('/benefits-chart', [BenefitController::class, 'chart']);

Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});