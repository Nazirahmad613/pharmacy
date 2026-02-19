<?php
namespace App\Http\Controllers;

use App\Models\Parchase;
use App\Models\ParchaseItem;
use App\Models\Journal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ParchasesController extends Controller
{
    public function index()
    {
        // اضافه کردن supplier و items.supplier برای تضمین دریافت نام حمایت‌کننده
        $parchases = Parchase::with([
            'items.medication',
            'items.category',
            'items.supplier', // هر آیتم ممکن است حمایت‌کننده داشته باشد
            'supplier'        // حمایت‌کننده مستقیم خرید
        ])->latest()->get();

        return response()->json($parchases);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'parchase_date' => 'required|date',
            'par_paid'      => 'required|numeric|min:0',
            'supplier_id'   => 'required|exists:registrations,reg_id',
            'items'         => 'required|array|min:1',
            'items.*.med_id'      => 'required|exists:medications,med_id',
            'items.*.category_id' => 'required|exists:categories,category_id',
            'items.*.type'        => 'nullable|string',
            'items.*.quantity'    => 'required|integer|min:1',
            'items.*.unit_price'  => 'required|numeric|min:0',
            'items.*.exp_date'    => 'required|date',
        ]);

        DB::beginTransaction();
        try {
            $total_parchase = collect($validated['items'])->sum(fn($item) => $item['quantity'] * $item['unit_price']);
            $due_par = $total_parchase - $validated['par_paid'];

            $parchase = Parchase::create([
                'parchase_date'  => $validated['parchase_date'],
                'total_parchase' => $total_parchase,
                'par_paid'       => $validated['par_paid'],
                'due_par'        => $due_par,
                'par_user'       => Auth::id(),
                'supplier_id'    => $validated['supplier_id'],
            ]);

            foreach ($validated['items'] as $item) {
                $parchase->items()->create([
                    'med_id'      => $item['med_id'],
                    'category_id' => $item['category_id'],
                    'type'        => $item['type'] ?? null,
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                    'exp_date'    => $item['exp_date'],
                    'supplier_id' => $validated['supplier_id'], // تضمین نام حمایت‌کننده در آیتم
                ]);
            }

            // ثبت ژورنال خرید
            Journal::create([
                'journal_date' => $parchase->parchase_date,
                'description'  => "خرید دارو شماره {$parchase->parchase_id}",
                'entry_type'   => Journal::ENTRY_DEBIT,
                'amount'       => $total_parchase,
                'ref_type'     => 'parchase',
                'ref_id'       => $parchase->parchase_id,
                'user_id'      => Auth::id(),
            ]);

            if ($validated['par_paid'] > 0) {
                Journal::create([
                    'journal_date' => $parchase->parchase_date,
                    'description'  => "پرداخت خرید شماره {$parchase->parchase_id}",
                    'entry_type'   => Journal::ENTRY_CREDIT,
                    'amount'       => $validated['par_paid'],
                    'ref_type'     => 'parchase',
                    'ref_id'       => $parchase->parchase_id,
                    'user_id'      => Auth::id(),
                ]);
            }

            DB::commit();
            return response()->json($parchase->load(['items.medication','items.category','items.supplier','supplier']), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Parchase Store Error', ['error'=>$e->getMessage(),'request'=>$request->all()]);
            return response()->json(['message'=>'خطا در ثبت خرید','error'=>$e->getMessage()],500);
        }
    }
}
