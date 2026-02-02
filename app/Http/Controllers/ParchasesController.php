<?php

namespace App\Http\Controllers;

use App\Models\Parchase;
use App\Models\ParchaseItem;
use App\Models\Supplier;
use App\Models\Medication;
use App\Models\Category;
use App\Models\Journal; // برای ثبت ژورنال
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ParchasesController extends Controller
{
    /**
     * لیست خریدها
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
     * ثبت خرید جدید همراه با ژورنال
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'parchase_date' => 'required|date',
            'par_paid'      => 'required|numeric|min:0',
            'purpose'       => 'required|string', // دارو، معاش، تجهیزات و غیره
            'description'   => 'nullable|string', // توضیح اختیاری برای خرید غیر دارو
            'items'         => 'sometimes|array|min:1', // فقط برای دارو الزامی است
            'items.*.med_id'        => 'required_if:purpose,دارو|exists:medications,med_id',
            'items.*.supplier_id'   => 'required_if:purpose,دارو|exists:suppliers,supplier_id',
            'items.*.category_id'   => 'required_if:purpose,دارو|exists:categories,category_id',
            'items.*.type'          => 'nullable|string',
            'items.*.quantity'      => 'required_if:purpose,دارو|integer|min:1',
            'items.*.unit_price'    => 'required_if:purpose,دارو|numeric|min:0',
            'items.*.exp_date'      => 'required_if:purpose,دارو|date',
            'total_parchase'        => 'required_if:purpose,!=,دارو|numeric|min:0', // برای غیر دارو
        ]);

        DB::beginTransaction();

        try {
            $purpose = $validated['purpose'];

            // محاسبه مجموع خرید
            if($purpose === 'دارو') {
                $total_parchase = collect($validated['items'])->sum(function ($item) {
                    return $item['quantity'] * $item['unit_price'];
                });
            } else {
                $total_parchase = $validated['total_parchase'];
            }

            $due_par = $total_parchase - $validated['par_paid'];

            // ایجاد خرید
            $parchase = Parchase::create([
                'parchase_date'  => $validated['parchase_date'],
                'total_parchase' => $total_parchase,
                'par_paid'       => $validated['par_paid'],
                'due_par'        => $due_par,
                'purpose'        => $purpose,
                'description'    => $validated['description'] ?? null,
                'par_user'       => Auth::id(),
            ]);

            // ذخیره آیتم‌ها در صورت خرید دارو
            if($purpose === 'دارو') {
                foreach ($validated['items'] as $item) {
                    $parchase->items()->create([
                        'med_id'      => $item['med_id'],
                        'supplier_id' => $item['supplier_id'],
                        'category_id' => $item['category_id'],
                        'type'        => $item['type'] ?? null,
                        'quantity'    => $item['quantity'],
                        'unit_price'  => $item['unit_price'],
                        'total_price' => $item['quantity'] * $item['unit_price'],
                        'exp_date'    => $item['exp_date'],
                    ]);
                }
            }

            // ===============================
            // 🔗 ثبت خودکار ژورنال
            // ===============================

            // 1️⃣ بدهکار - موجودی کالا یا هدف خرید
            Journal::create([
                'journal_date' => $parchase->parchase_date,
                'description'  => "خرید ({$purpose}) - شماره {$parchase->parchase_id}",
                'debit'        => $total_parchase,
                'credit'       => 0,
                'ref_type'     => 'parchase',
                'ref_id'       => $parchase->parchase_id,
                'user_id'      => Auth::id(),
            ]);

            // 2️⃣ بستانکار - پرداخت نقد
            if($validated['par_paid'] > 0){
                Journal::create([
                    'journal_date' => $parchase->parchase_date,
                    'description'  => "پرداخت نقد - خرید شماره {$parchase->parchase_id}",
                    'debit'        => 0,
                    'credit'       => $validated['par_paid'],
                    'ref_type'     => 'payment_out',
                    'ref_id'       => $parchase->parchase_id,
                    'user_id'      => Auth::id(),
                ]);
            }

            // 3️⃣ بستانکار - بدهی مانده
            if($due_par > 0){
                Journal::create([
                    'journal_date' => $parchase->parchase_date,
                    'description'  => "بدهی خرید - خرید شماره {$parchase->parchase_id}",
                    'debit'        => 0,
                    'credit'       => $due_par,
                    'ref_type'     => 'parchase_due',
                    'ref_id'       => $parchase->parchase_id,
                    'user_id'      => Auth::id(),
                ]);
            }

            DB::commit();

            return response()->json([
                'message'       => 'خرید با موفقیت ثبت شد',
                'parchase_id'   => $parchase->parchase_id,
                'total_parchase'=> $total_parchase,
                'par_paid'      => $validated['par_paid'],
                'due_par'       => $due_par,
                'purpose'       => $purpose,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Parchase Store Error', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'message' => 'خطا در ثبت خرید',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * لود داده‌های انتخابی فرم
     */
    public function loadOptions()
    {
        return response()->json([
            'medications' => Medication::select('med_id', 'gen_name')->get(),
            'suppliers'   => Supplier::select('supplier_id', 'supplier_name')->get(),
            'categories'  => Category::select('category_id', 'category_name')->get(),
        ]);
    }
}
