<?php

namespace App\Http\Controllers;

use App\Models\Parchase;
use App\Models\ParchaseItem;
use App\Models\Medication;
use App\Models\Category;
use App\Models\Journal; // ژورنال برای ثبت تراکنش‌ها
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ParchasesController extends Controller
{
    /**
     * لیست خرید داروها
     */
    public function index()
    {
        try {
            $parchases = Parchase::with([
                'items.medication',
                'items.supplier',
                'items.category'
            ])->latest()->get();

            return response()->json($parchases);

        } catch (\Exception $e) {
            Log::error('Fetch Parchases Error', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'خطا در دریافت لیست خریدها'
            ], 500);
        }
    }

    /**
     * ثبت خرید دارو همراه با ژورنال
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'parchase_date' => 'required|date',
            'par_paid'      => 'required|numeric|min:0',
            'items'         => 'required|array|min:1',
            'items.*.med_id'      => 'required|exists:medications,med_id',
            'items.*.supplier_id' => 'required|exists:registrations,reg_id', // توجه: از جدول registrations
            'items.*.category_id' => 'required|exists:categories,category_id',
            'items.*.type'        => 'nullable|string',
            'items.*.quantity'    => 'required|integer|min:1',
            'items.*.unit_price'  => 'required|numeric|min:0',
            'items.*.exp_date'    => 'required|date',
        ]);

        DB::beginTransaction();

        try {
            // محاسبه مجموع خرید
            $total_parchase = collect($validated['items'])->sum(function ($item) {
                return $item['quantity'] * $item['unit_price'];
            });

            $due_par = $total_parchase - $validated['par_paid'];

            // ایجاد خرید
            $parchase = Parchase::create([
                'parchase_date'  => $validated['parchase_date'],
                'total_parchase' => $total_parchase,
                'par_paid'       => $validated['par_paid'],
                'due_par'        => $due_par,
                'par_user'       => Auth::id(),
            ]);

            // ذخیره آیتم‌ها
            foreach ($validated['items'] as $item) {
                $parchase->items()->create([
                    'med_id'      => $item['med_id'],
                    'supplier_id' => $item['supplier_id'], // از registrations
                    'category_id' => $item['category_id'],
                    'type'        => $item['type'] ?? null,
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                    'exp_date'    => $item['exp_date'],
                ]);
            }

            // ===============================
            // 🔗 ثبت خودکار ژورنال
            // ===============================
                    // ===============================
// 🔗 ثبت خودکار ژورنال
// ===============================

 // ===============================
// 🔗 ثبت ژورنال اصلاح‌شده خرید
// ===============================

$supplierId = $validated['items'][0]['supplier_id']; // فرض: همه آیتم‌ها یک supplier دارند

// 1️⃣ بدهکار - موجودی
Journal::create([
    'journal_date' => $parchase->parchase_date,
    'description'  => "خرید دارو",
    'entry_type'   => Journal::ENTRY_DEBIT,
    'amount'       => $total_parchase,
    'ref_type'     => 'supplier',   // 👈 تغییر مهم
    'ref_id'       => $supplierId,  // 👈 reg_id حمایت‌کننده
    'user_id'      => Auth::id(),
]);

// 2️⃣ پرداخت نقد
if($validated['par_paid'] > 0){
    Journal::create([
        'journal_date' => $parchase->parchase_date,
        'description'  => "پرداخت به حمایت‌کننده",
        'entry_type'   => Journal::ENTRY_CREDIT,
        'amount'       => $validated['par_paid'],
        'ref_type'     => 'supplier',  // 👈 تغییر
        'ref_id'       => $supplierId,
        'user_id'      => Auth::id(),
    ]);
}

// 3️⃣ بدهی باقی‌مانده
if($due_par > 0){
    Journal::create([
        'journal_date' => $parchase->parchase_date,
        'description'  => "بدهی حمایت‌کننده",
        'entry_type'   => Journal::ENTRY_CREDIT,
        'amount'       => $due_par,
        'ref_type'     => 'supplier',  // 👈 تغییر
        'ref_id'       => $supplierId,
        'user_id'      => Auth::id(),
    ]);
}



            DB::commit();

            return response()->json([
                'message'       => 'خرید دارو با موفقیت ثبت شد',
                'parchase_id'   => $parchase->parchase_id,
                'total_parchase'=> $total_parchase,
                'par_paid'      => $validated['par_paid'],
                'due_par'       => $due_par,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Parchase Store Error', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'message' => 'خطا در ثبت خرید دارو',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * لود داده‌های انتخابی فرم خرید دارو
     * واکشی حمایت‌کنندگان از registrations با reg_type='supplier'
     */
    public function loadOptions()
    {
        $suppliers = DB::table('registrations')
            ->select('reg_id', 'full_name', 'name')
            ->where('reg_type', 'supplier')
            ->get();

        return response()->json([
            'medications' => Medication::select('med_id', 'gen_name', 'supplier_id', 'type', 'unit_price', 'category_id')->get(),
            'suppliers'   => $suppliers,
            'categories'  => Category::select('category_id', 'category_name')->get(),
        ]);
    }
}
