<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Registrations;
use App\Models\Journal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PrescriptionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'patient_id'   => 'required',
            'doc_id'       => 'required',
            'pres_date'    => 'required|date',
            'items'        => 'required|array|min:1',
            'total_amount' => 'required|numeric',
            'net_amount'   => 'required|numeric',
        ]);

        DB::transaction(function () use ($request) {

            // ===== snapshot مریض و داکتر =====
            $patient = Registrations::find($request->patient_id);
            $doc     = Registrations::find($request->doc_id);

        $lastPres = Prescription::orderBy('pres_num', 'desc')->lockForUpdate()->first();
        $newPresNum = $lastPres ? $lastPres->pres_num + 1 : 1;


            // ===== ثبت نسخه =====
            $prescription = Prescription::create([
                'patient_id'          => $request->patient_id,
                'patient_name'        => $patient->full_name ?? $patient->name ?? null,
                'patient_age'         => $patient->age ?? null,
                'patient_phone'       => $patient->phone ?? null,
                'patient_blood_group' => $patient->blood_group ?? null,

                'doc_id'   => $request->doc_id,
                'doc_name' => $doc->full_name ?? $doc->name ?? null,

                 'pres_num'     => $newPresNum, 
                'pres_date'    => $request->pres_date,
                'total_amount' => $request->total_amount,
                'discount'     => $request->discount ?? 0,
                'net_amount'   => $request->net_amount,
            ]);

            // ===== آیتم‌های نسخه =====
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
                    'total_price' => $item['total_price'],
                    'remarks'     => $item['remarks'] ?? null,
                ]);
            }

            // =========================
            // ثبت ژورنال (نسخه) با نام مریض و داکتر
            // =========================

            $refInfo = [
                'patient_name' => $prescription->patient_name,
                'doc_name'     => $prescription->doc_name,
            ];
// 🔴 بدهکار: مریض
Journal::create([
    'journal_date' => $request->pres_date,
    'entry_type'   => 'debit',
    'amount'       => $request->net_amount,
    'description'  => 'بدهکاری مریض بابت نسخه شماره ' . $request->pres_num,
    'ref_type'     => 'patient',              // 👈 تغییر مهم
    'ref_id'       => $request->patient_id,   // 👈 reg_id مریض
    'user_id'      => Auth::id(),
]);

// 🟢 بستانکار: فروش دوا
Journal::create([
    'journal_date' => $request->pres_date,
    'entry_type'   => 'credit',
    'amount'       => $request->net_amount,
    'description'  => 'فروش دوا بابت نسخه شماره ' . $request->pres_num,
    'ref_type'     => 'patient',              // 👈 تغییر
    'ref_id'       => $request->patient_id,
    'user_id'      => Auth::id(),
]);

         
        });

        return response()->json([
            'message' => 'Prescription & Journal saved successfully'
        ], 201);
    }
}
