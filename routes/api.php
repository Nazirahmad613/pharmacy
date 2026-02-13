 <?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ==================== Controllers ====================
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MedicationController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\CustomersController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\SalesDetailsController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\OrdersController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\DaySalesController;
use App\Http\Controllers\ViewDoctorPrescriptionsController;
use App\Http\Controllers\ViewInventoryController;
use App\Http\Controllers\ViewMedicationsController;
use App\Http\Controllers\ViewMounthlySales;
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
|
| این routeها برای React SPA عمومی هستند، بدون نیاز به CSRF یا session
|
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Token-based)
|--------------------------------------------------------------------------
|
| فقط token-based auth (auth:sanctum) استفاده می‌شود.
| هیچ middleware stateful / session / CSRF اضافه نیست.
|
*/
Route::middleware('auth:sanctum')->group(function () {


    // ===== Auth =====
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);


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


//   journals   // ===== Journals =====
    Route::get('/journals', [JournalController::class, 'index']); // نمایش همه یا فیلتر شده
    Route::get('/journals/{id}', [JournalController::class, 'show']); // نمایش جزئیات یک ژورنال
    Route::post('/journals', [JournalController::class, 'store']); // ثبت ژورنال جدید
    Route::put('/journals/{id}', [JournalController::class, 'update']); // بروزرسانی ژورنال
    Route::delete('/journals/{id}', [JournalController::class, 'destroy']); // حذف ژورنال
 


    // ===== Reports / Views =====
    Route::get('/view-inventory', [ViewInventoryController::class, 'index']);
    Route::get('/view-medications', [ViewMedicationsController::class, 'index']);
 
   
    Route::get('/view-profit-loss', [ViewProfitLossController::class, 'index']);
    Route::get('/view-supplier-purchases', [ViewSupplierPurchasesController::class, 'index']);
    Route::get('/hospital-reports', [HospitalReportController::class, 'index']);

});
