<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Journal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PrescriptionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required',
            'doc_id' => 'required',
            'pres_date' => 'required|date',
            'items' => 'required|array|min:1',
        ]);

        DB::transaction(function () use ($request) {

            // 🔹 محاسبات سرور (امن)
            $totalAmount = collect($request->items)
                ->sum(fn ($i) => $i['quantity'] * $i['unit_price']);

            $discount  = $request->discount ?? 0;
            $netAmount = $totalAmount - $discount;

            // 🔹 ثبت نسخه
            $prescription = Prescription::create([
                'patient_id'   => $request->patient_id,
                'doc_id'       => $request->doc_id,
                'pres_num'     => $request->pres_num,
                'pres_date'    => $request->pres_date,
                'total_amount' => $totalAmount,
                'discount'     => $discount,
                'net_amount'   => $netAmount,
            ]);

            // 🔹 ثبت آیتم‌ها
            foreach ($request->items as $item) {
                PrescriptionItem::create([
                    'pres_id'     => $prescription->pres_id,
                    'category_id' => $item['category_id'],
                    'med_id'      => $item['med_id'],
                    'supplier_id' => $item['supplier_id'],
                    'type'        => $item['type'] ?? null,
                    'dosage'      => $item['dosage'] ?? null,
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                    'remarks'     => $item['remarks'] ?? null,
                ]);
            }

            // =========================
            // 🔥 ثبت چورنال
            // =========================

            // بدهکار: حساب مریض
            Journal::create([
                'ref_type' => 'prescription',
                'ref_id'   => $prescription->pres_id,
                'account_code' => 'AR_PATIENT',
                'debit'    => $netAmount,
                'credit'   => 0,
                'description' => 'Prescription #' . $prescription->pres_num,
            ]);

            // بستانکار: فروش دوا
            Journal::create([
                'ref_type' => 'prescription',
                'ref_id'   => $prescription->pres_id,
                'account_code' => 'SALES_REVENUE',
                'debit'    => 0,
                'credit'   => $totalAmount,
                'description' => 'Medicine sales',
            ]);

            // بدهکار: تخفیف (اگر وجود داشت)
            if ($discount > 0) {
                Journal::create([
                    'ref_type' => 'prescription',
                    'ref_id'   => $prescription->pres_id,
                    'account_code' => 'SALES_DISCOUNT',
                    'debit'    => $discount,
                    'credit'   => 0,
                    'description' => 'Discount',
                ]);
            }
        });

        return response()->json([
            'message' => 'Prescription & journal saved successfully'
        ], 201);
    }
}
