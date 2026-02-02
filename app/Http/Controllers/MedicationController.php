<?php
 namespace App\Http\Controllers;

use App\Models\Medication;
use App\Models\Supplier;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Exception;

class MedicationController extends Controller
{
    /**
     * 📋 لیست تمام دواها با کتگوری و سپلایر
     */
    public function index()
    {
        $medications = Medication::with(['supplier', 'category'])
            ->orderBy('med_id', 'desc')
            ->get();

        return response()->json($medications);
    }

    /**
     * 💾 ثبت دوا جدید از طریق React
     */
    public function store(Request $request)
    {
        // دریافت نام تیبل‌های واقعی
        $catTable = (new Category())->getTable(); // categories
        $supplierTable = (new Supplier())->getTable(); // suppliers

        // اعتبارسنجی داده‌ها
        $validated = $request->validate([
            'category_id' => ['required', 'integer', Rule::exists($catTable, 'category_id')],
            'supplier_id' => ['required', 'integer', Rule::exists($supplierTable, 'supplier_id')],
            'gen_name'    => 'required|string|max:255',
            'dosage'      => 'required|string|max:255',
            'type'      => 'required|string|max:255',
             
        ]);

        try {
            $medication = Medication::create($validated);

            $medication = Medication::with(['supplier', 'category'])
                ->find($medication->med_id);

            return response()->json([
                'message' => '✅ دارو با موفقیت ثبت شد',
                'medication' => $medication
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => '❌ خطا در ثبت دارو',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🧾 نمایش یک داروی خاص (برای صفحه Edit در React)
     */
    public function show($med_id)
    {
        $medication = Medication::with(['supplier', 'category'])->find($med_id);

        if (!$medication) {
            return response()->json(['error' => 'دارو پیدا نشد.'], 404);
        }

        return response()->json($medication);
    }

    /**
     * ✏️ ویرایش دارو
     */
    public function update(Request $request, $med_id)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,supplier_id',
            'category_id' => 'required|exists:categories,category_id',
            'gen_name'    => 'required|string|max:255',
            'dosage'      => 'required|string|max:255',
            'unit_price'  => 'required|numeric|min:0',
            'quantity'    => 'nullable|integer|min:0',
            'exp_date'    => 'nullable|date',
        ]);

        $medication = Medication::find($med_id);
        if (!$medication) {
            return response()->json(['error' => 'دارو پیدا نشد.'], 404);
        }

        $medication->update($validated);

        return response()->json([
            'message' => '✅ دارو با موفقیت به‌روزرسانی شد.',
            'medication' => $medication
        ]);
    }

    /**
     * ❌ حذف دارو
     */
    public function destroy($med_id)
    {
        $medication = Medication::find($med_id);
        if (!$medication) {
            return response()->json(['error' => 'دارو پیدا نشد.'], 404);
        }

        $medication->delete();

        return response()->json(['message' => '✅ دارو با موفقیت حذف شد.']);
    }
    
}
