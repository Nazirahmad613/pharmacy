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
 public function index()
{
    $prescriptions = \App\Models\Prescription::with('items')->latest()->get();

    return response()->json([
        'data' => $prescriptions
    ]);
}

    public function store(Request $request)
    {
        $request->validate([
            'patient_id'      => 'required',
            'doc_id'          => 'required',
            'pres_date'       => 'required|date',
            'items'           => 'required|array|min:1',
            'total_amount'    => 'required|numeric',
            'net_amount'      => 'required|numeric',
            'tazkira_number'  => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {

            $patient = Registrations::find($request->patient_id);
            $doc     = Registrations::find($request->doc_id);

            $lastPres = Prescription::orderBy('pres_num', 'desc')->lockForUpdate()->first();
            $newPresNum = $lastPres ? $lastPres->pres_num + 1 : 1;

            $prescription = Prescription::create([
                'patient_id'          => $request->patient_id,
                'patient_name'        => $patient->full_name ?? $patient->name ?? null,
                'tazkira_number'      => $request->tazkira_number ?? $patient->tazkira_number ?? null,
                'patient_age'         => $patient->age ?? null,
                'patient_gender'      => $patient->gender ?? null,
                'patient_phone'       => $patient->phone ?? null,
                'patient_blood_group' => $patient->blood_group ?? null,
                'doc_id'              => $request->doc_id,
                'doc_name'            => $doc->full_name ?? $doc->name ?? null,
                'pres_num'            => $newPresNum,
                'pres_date'           => $request->pres_date,
                'total_amount'        => $request->total_amount,
                'discount'            => $request->discount ?? 0,
                'net_amount'          => $request->net_amount,
            ]);

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

            Journal::create([
                'journal_date'  => $request->pres_date,
                'entry_type'    => 'debit',
                'amount'        => $request->net_amount,
                'description'   => 'بدهکاری مریض بابت نسخه شماره '.$newPresNum,
                'ref_type'      => 'patient',
                'ref_id'        => $request->patient_id,
                'tazkira_number'=> $request->tazkira_number ?? $patient->tazkira_number ?? null,
                'pres_id'       => $prescription->pres_id,
                'pres_num'      => $newPresNum,
                'user_id'       => Auth::id(),
            ]);

            Journal::create([
                'journal_date'  => $request->pres_date,
                'entry_type'    => 'credit',
                'amount'        => $request->net_amount,
                'description'   => 'فروش دوا بابت نسخه شماره '.$newPresNum,
                'ref_type'      => 'patient',
                'ref_id'        => $request->patient_id,
                'tazkira_number'=> $request->tazkira_number ?? $patient->tazkira_number ?? null,
                'pres_id'       => $prescription->pres_id,
                'pres_num'      => $newPresNum,
                'user_id'       => Auth::id(),
            ]);

        });

        return response()->json(['message'=>'Prescription saved'],201);
    }


public function update(Request $request,$id)
{
    DB::transaction(function () use ($request,$id) {

        $pres = Prescription::findOrFail($id);

        $patient = Registrations::find($request->patient_id);
        $doc     = Registrations::find($request->doc_id);

        $pres->update([
            'patient_id'          => $request->patient_id,
            'patient_name'        => $patient->full_name ?? $patient->name ?? null,
            'tazkira_number'      => $request->tazkira_number ?? $patient->tazkira_number ?? null,
            'patient_age'         => $patient->age ?? null,
            'patient_gender'      => $patient->gender ?? null,
            'patient_phone'       => $patient->phone ?? null,
            'patient_blood_group' => $patient->blood_group ?? null,
            'doc_id'              => $request->doc_id,
            'doc_name'            => $doc->full_name ?? $doc->name ?? null,
            'pres_date'           => $request->pres_date,
            'total_amount'        => $request->total_amount,
            'discount'            => $request->discount ?? 0,
            'net_amount'          => $request->net_amount,
        ]);

        // حذف آیتم های قبلی
        PrescriptionItem::where('pres_id',$pres->pres_id)->delete();

        // ثبت آیتم های جدید
        foreach ($request->items as $item) {

            PrescriptionItem::create([
                'pres_id'     => $pres->pres_id,
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

    });

    return response()->json(['message'=>'updated']);
}
     
    public function destroy($id)
    {
        PrescriptionItem::where('pres_id',$id)->delete();
        Prescription::where('pres_id',$id)->delete();

        return response()->json(['message'=>'deleted']);
    }

}