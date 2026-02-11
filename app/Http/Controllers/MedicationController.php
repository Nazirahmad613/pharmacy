<?php

namespace App\Http\Controllers;

use App\Models\Medication;
use App\Models\Category;
use App\Models\Registrations;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Exception;

class MedicationController extends Controller
{
    /**
     * 📋 لیست دواها با کتگوری و حمایت‌کننده
     */
    public function index()
    {
        $medications = Medication::with(['category', 'supplier'])
            ->orderBy('med_id', 'desc')
            ->get();

        return response()->json($medications);
    }

    /**
     * 💾 ثبت دوا جدید
     */
 
 public function store(Request $request)
{
    $categoryTable = (new Category())->getTable();
    $registrationTable = (new Registrations())->getTable();

    $validated = $request->validate([
        'category_id' => ['required','integer', Rule::exists($categoryTable,'category_id')],
        'supplier_id' => ['required','integer', Rule::exists($registrationTable,'reg_id')->where('reg_type','supplier')],
        'gen_name' => 'required|string|max:255',
        'dosage'   => 'required|string|max:255',
        'type'     => 'required|string|max:255',
    ]);

    try {
        // فقط ثبت دوا، بدون تراکنش و ژورنال
        $medication = Medication::create($validated);

        return response()->json([
            'message' => '✅ دوا با موفقیت ثبت شد',
            'medication' => Medication::with('category','supplier')->find($medication->med_id)
        ], 201);

    } catch (\Exception $e) {
        return response()->json([
            'error' => '❌ خطا در ثبت دوا',
            'message' => $e->getMessage()
        ], 500);
    }
}



    public function show($med_id)
    {
        $medication = Medication::with(['category', 'supplier'])->find($med_id);

        if (!$medication) {
            return response()->json(['error' => 'دوا پیدا نشد'], 404);
        }

        return response()->json($medication);
    }

    /**
     * ✏️ ویرایش دوا
     */
    public function update(Request $request, $med_id)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,category_id',

            // ✅ دوباره فقط supporter
            'supplier_id' => [
                'required',
                Rule::exists('registrations', 'id')
                    ->where('reg_type', 'supporter')
            ],

            'gen_name' => 'required|string|max:255',
            'dosage'   => 'required|string|max:255',
            'type'     => 'required|string|max:255',
        ]);

        $medication = Medication::find($med_id);
        if (!$medication) {
            return response()->json(['error' => 'دوا پیدا نشد'], 404);
        }

        $medication->update($validated);

        return response()->json([
            'message' => '✅ دوا با موفقیت ویرایش شد',
            'medication' => $medication
        ]);
    }

    /**
     * ❌ حذف دوا
     */
    public function destroy($med_id)
    {
        $medication = Medication::find($med_id);
        if (!$medication) {
            return response()->json(['error' => 'دوا پیدا نشد'], 404);
        }

        $medication->delete();

        return response()->json(['message' => '✅ دوا با موفقیت حذف شد']);
    }
}
