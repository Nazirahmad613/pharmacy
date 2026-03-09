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
    $prescriptions = Prescription::with([
        'items.medication',
        'items.category',
        'items.supplier'
    ])->latest()->get();

    $data = $prescriptions->map(function ($pres) {

        return [
            'pres_id'       => $pres->pres_id,
            'patient_id'    => $pres->patient_id,
            'doc_id'        => $pres->doc_id,
            'pres_num'      => $pres->pres_num,
            'pres_date'     => $pres->pres_date,
            'total_amount'  => $pres->total_amount,
            'discount'      => $pres->discount,
            'net_amount'    => $pres->net_amount,

            'items' => $pres->items->map(function ($item) {
                return [
                    'pres_it_id'   => $item->pres_it_id,
                    'category_id'  => $item->category_id,
                    'med_id'       => $item->med_id,
                    'supplier_id'  => $item->supplier_id,

                    'category_name'=> $item->category->category_name ?? '-',
                    'med_name'     => $item->medication->gen_name ?? '-',
                    'supplier_name'=> $item->supplier->full_name ?? '-',

                    'type'         => $item->type,
                    'dosage'       => $item->dosage,
                    'quantity'     => $item->quantity,
                    'unit_price'   => $item->unit_price,
                    'total_price'  => $item->total_price,
                    'remarks'      => $item->remarks,
                ];
            })
        ];
    });

    return response()->json(['data'=>$data]);
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
 public function update(Request $request, $pres_id)
{
    DB::beginTransaction();

    try {
        $pres = Prescription::with('items')->findOrFail($pres_id);
        $patient = Registrations::find($request->patient_id);
        $doc     = Registrations::find($request->doc_id);

        // محاسبه مقادیر
        $totalAmount = collect($request->items)->sum(fn($i) => $i['total_price']);
        $discount = $request->discount ?? 0;
        $netAmount = $request->net_amount ?? ($totalAmount - $discount);

        // حذف آیتم‌های قبلی نسخه
        $pres->items()->delete();

        // ثبت آیتم‌های جدید
        foreach ($request->items as $item) {
            $pres->items()->create([
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

        // آپدیت خود نسخه
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
            'total_amount'        => $totalAmount,
            'discount'            => $discount,
            'net_amount'          => $netAmount,
        ]);

        // حذف ژورنال‌های قدیمی مرتبط با این نسخه
        Journal::where('pres_id', $pres_id)->delete();

        // ثبت مجدد ژورنال‌ها
        Journal::create([
            'journal_date'  => $request->pres_date,
            'entry_type'    => 'debit',
            'amount'        => $netAmount,
            'description'   => 'بدهکاری مریض بابت نسخه شماره ' . $pres->pres_num,
            'ref_type'      => 'patient',
            'ref_id'        => $request->patient_id,
            'tazkira_number'=> $request->tazkira_number ?? $patient->tazkira_number ?? null,
            'pres_id'       => $pres->pres_id,
            'pres_num'      => $pres->pres_num,
            'user_id'       => Auth::id(),
        ]);

        Journal::create([
            'journal_date'  => $request->pres_date,
            'entry_type'    => 'credit',
            'amount'        => $netAmount,
            'description'   => 'فروش دوا بابت نسخه شماره ' . $pres->pres_num,
            'ref_type'      => 'patient',
            'ref_id'        => $request->patient_id,
            'tazkira_number'=> $request->tazkira_number ?? $patient->tazkira_number ?? null,
            'pres_id'       => $pres->pres_id,
            'pres_num'      => $pres->pres_num,
            'user_id'       => Auth::id(),
        ]);

        DB::commit();

        return response()->json(['message' => 'Prescription updated successfully']);

    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('Prescription update error', [
            'error' => $e->getMessage(),
            'request' => $request->all(),
            'pres_id' => $pres_id,
        ]);
        return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
    }
}

public function destroy($pres_id)
{
    DB::beginTransaction();

    try {
        $pres = Prescription::with('items')->findOrFail($pres_id);

        // حذف آیتم‌ها
        $pres->items()->delete();

        // حذف ژورنال‌های مرتبط
        Journal::where('pres_id', $pres_id)->delete();

        // حذف خود نسخه
        $pres->delete();

        DB::commit();

        return response()->json(['message' => 'Prescription deleted successfully']);
    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('Prescription delete error', [
            'error' => $e->getMessage(),
            'pres_id' => $pres_id,
        ]);
        return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
    }
}


}