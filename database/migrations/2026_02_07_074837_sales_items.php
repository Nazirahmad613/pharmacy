<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Registrations;
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

            // 1️⃣ snapshot اطلاعات مریض و داکتر
            $patient = Registrations::find($request->patient_id);
            $doc = Registrations::find($request->doc_id);

            $prescription = Prescription::create([
                'patient_id'         => $request->patient_id,
                'patient_name'       => $patient->full_name ?? $patient->name ?? null,
                'patient_age'        => $patient->age ?? null,
                'patient_phone'      => $patient->phone ?? null,
                'patient_blood_group'=> $patient->blood_group ?? null,

                'doc_id'             => $request->doc_id,
                'doc_name'           => $doc->full_name ?? $doc->name ?? null,

                'pres_num'           => $request->pres_num,
                'pres_date'          => $request->pres_date,
                'total_amount'       => $request->total_amount,
                'discount'           => $request->discount,
                'net_amount'         => $request->net_amount,
            ]);

            // 2️⃣ ثبت آیتم‌های نسخه
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

            // 3️⃣ ثبت journal
            // مثال ساده: debit = net_amount، credit = 0، description = نام مریض + شماره نسخه
            Journal::create([
                'ref_type'   => 'Prescription',
                'ref_id'     => $prescription->pres_id,
                'date'       => $prescription->pres_date,
                'description'=> "نسخه مریض: {$prescription->patient_name}, شماره: {$prescription->pres_num}",
                'debit'      => $prescription->net_amount,
                'credit'     => 0,
                'balance'    => $prescription->net_amount, // در صورت نیاز محاسبه متغیر balance
            ]);
        });

        return response()->json([
            'message' => 'Prescription and journal saved successfully'
        ], 201);
    }
}
