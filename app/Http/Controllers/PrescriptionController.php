<?php

namespace App\Http\Controllers;
  
 
use App\Models\Doctor;
use App\Models\Medication;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\PrescriptionItem;

class PrescriptionController extends Controller
{
    // گرفتن لیست کامل نسخه‌ها همراه با آیتم‌ها
    public function index()
    {
        $prescriptions = Prescription::with('items')->get();
        return response()->json($prescriptions);
    }

    // ثبت نسخه
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pa_name' => 'required|string|max:255',
            'pres_num' => 'nullable|numeric',
            'pa_age' => 'required|integer|min:0',
            'pres_date' => 'required|date',
            'doc_id' => 'required|integer|exists:doctors,doc_id',
            'total_amount' => 'required|numeric',
            'discount' => 'nullable|numeric',
            'net_amount' => 'required|numeric',
            'created_by' => 'nullable|integer',
            'items' => 'required|array|min:1',
            'items.*.med_id' => 'required|integer|exists:medications,med_id',
            'items.*.supplier_id' => 'required|integer|exists:suppliers,supplier_id',
            'items.*.category_id' => 'required|integer|exists:categories,category_id',
            
            'items.*.dosage' => 'required|string|max:255',
            'items.*.type' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.total_price' => 'required|numeric|min:0',
            'items.*.remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            // ذخیره نسخه
            $prescription = Prescription::create([
                'pa_name' => $validated['pa_name'],
                'pres_num' => $validated['pres_num'] ?? null,
                'pa_age' => $validated['pa_age'],
                'pres_date' => $validated['pres_date'],
                'doc_id' => $validated['doc_id'],
                'total_amount' => $validated['total_amount'],
                'discount' => $validated['discount'] ?? 0,
                'net_amount' => $validated['net_amount'],
                'remarks' => $validated['remarks'] ?? '',
                'created_by' => $validated['created_by'] ?? 1,
            ]);

            // ذخیره آیتم‌ها با نام حمایت‌کننده
            foreach ($validated['items'] as $item) {
                $prescription->items()->create([
                    'med_id' => $item['med_id'],
                    'category_id' => $item['category_id'],
                    'supplier_id' => $item['supplier_id'], // ← فقط نام
                    'dosage' => $item['dosage'],
                    'type' => $item['type'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['total_price'],
                    'remarks' => $item['remarks'] ?? '',
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'نسخه با موفقیت ثبت شد.',
                'prescription_id' => $prescription->pres_id ?? $prescription->id,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('خطا در ثبت نسخه: ' . $e->getMessage());
            return response()->json([
                'error' => 'خطا در ثبت نسخه',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    // حذف نسخه
    public function destroy($id)
    {
        $prescription = Prescription::find($id);
        if ($prescription) {
            $prescription->delete();
            return response()->json(['message' => 'نسخه حذف شد']);
        }
        return response()->json(['message' => 'نسخه یافت نشد'], 404);
    }
}
