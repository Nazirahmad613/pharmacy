<?php
namespace App\Http\Controllers;
 
use App\Models\Parchase;
use App\Models\ParchaseItem; // نام صحیح مدل آیتم‌های خرید
use App\Models\Supplier;
use App\Models\Medication;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ParchasesController extends Controller
{
    // لیست خریدها
    public function index()
{
    try {
        $parchases = Parchase::with(['items.medication', 'items.supplier', 'items.category'])->get();
        return response()->json($parchases);
    } catch (\Exception $e) {
        Log::error('Error fetching purchases: ' . $e->getMessage());
        return response()->json([
            'message' => 'Server Error',
            'error' => $e->getMessage()
        ], 500);
    }
}

    // ذخیره خرید جدید
    public function store(Request $request)
    {
        $validated = $request->validate([
            'parchase_date' => 'required|date',
            'total_parchase' => 'required|numeric',
            'par_paid' => 'required|numeric|min:0',
            'due_par' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.med_id' => 'required|exists:medications,med_id',
            'items.*.supplier_id' => 'required|exists:suppliers,supplier_id',
            'items.*.category_id' => 'required|exists:categories,category_id',
            'items.*.type' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.total_price' => 'required|numeric|min:0',
            'items.*.exp_date' => 'required|date',

            

        ]);

        DB::beginTransaction();

        try {
            // ایجاد رکورد خرید
            $parchase =Parchase::create([
                'parchase_date' => $validated['parchase_date'],
                'total_parchase' => $validated['total_parchase'],
                'par_paid' => $validated['par_paid'],
                'due_par' => $validated['due_par'],
            ]);

            // ذخیره آیتم‌ها با مدل صحیح Parchaseitems
            foreach ($validated['items'] as $item) {
                $parchase->items()->create([
                    'med_id' => $item['med_id'],
                    'supplier_id' => $item['supplier_id'],
                    'category_id' => $item['category_id'],
                   'type' => $item['type'] ?? '', 
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['total_price'],
                    'exp_date' => $item['exp_date'],
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Purchase saved successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Parchase store error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Server Error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // لود دیتاهای انتخابی
    public function loadOptions()
    {
        return response()->json([
            'medications' => Medication::all(),
            'suppliers'   => Supplier::all(),
            'categories'  => Category::all(),
        ]);
    }
}
