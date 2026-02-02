<?php

namespace App\Http\Controllers;
 
 

use App\Models\Parchase;
use App\Models\ParchaseItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ParchasesController extends Controller
{
    // لیست خریدها
    public function index()
    {
        $parchases = Parchase::with('items.medication', 'items.supplier', 'items.category')->get();
        return response()->json($parchases);
    }

    // ذخیره خرید جدید
    public function store(Request $request)
    {
        $validated = $request->validate([
            'parchase_date' => 'required|date',
            'total_parchase' => 'required|numeric',
            'items' => 'required|array|min:1',
            'items.*.med_id' => 'required|exists:medications,medication_med_id',
            'items.*.supplier_id' => 'required|exists:suppliers,supplier_id',
            'items.*.category_id' => 'required|exists:categories,category_id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.total_price' => 'required|numeric|min:0'
        ]);

        DB::beginTransaction();
        try {
            $parchase = Parchase::create([
                'parchase_date' => $validated['parchase_date'],
                'total_parchase' => $validated['total_parchase']
            ]);

            foreach ($validated['items'] as $item) {
                $parchase->items()->create($item);
            }

            DB::commit();
            return response()->json(['message' => 'Purchase saved successfully'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Purchase store error: ' . $e->getMessage());
            return response()->json(['message' => 'Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    // API برای لود داروها، حمایت‌کننده‌ها و کتگوری‌ها
    public function loadOptions()
    {
        $medications = \App\Models\Medication::all();
        $suppliers = \App\Models\Supplier::all();
        $categories = \App\Models\Category::all();

        return response()->json([
            'medications' => $medications,
            'suppliers' => $suppliers,
            'categories' => $categories
        ]);
    }
}
