<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use App\Models\Registrations;
use App\Models\Sales;
use App\Models\Parchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class JournalController extends Controller
{
    /**
     * نمایش لیست ژورنال‌ها
     */
    public function index(Request $request)
    {
        $query = Journal::query();

        if ($request->filled('type')) $query->where('entry_type', $request->type);
        if ($request->filled('from')) $query->whereDate('journal_date', '>=', $request->from);
        if ($request->filled('to')) $query->whereDate('journal_date', '<=', $request->to);
        if ($request->filled('ref_type')) $query->where('ref_type', $request->ref_type);
        if ($request->filled('ref_id')) $query->where('ref_id', $request->ref_id);

        $journals = $query->orderBy('journal_date', 'desc')->get();

        $journals->transform(function ($j) {

            $j->full_name = null;
            $j->display_name = null;

            // برای ref_type های استاندارد ثبت شده در جدول Registrations
            if (in_array($j->ref_type, ['doctor', 'patient', 'customer', 'supplier'])) {
                $reg = Registrations::where('reg_type', $j->ref_type)
                    ->where('reg_id', $j->ref_id)
                    ->first();
                $j->full_name = $reg->full_name ?? null;
                $j->display_name = $reg->full_name ?? null;
            }

            // ref_type فروش
            if ($j->ref_type === 'sale') {
                $sale = Sales::find($j->ref_id);
                $j->display_name = $sale->customer->full_name ?? "فروش شماره {$j->ref_id}";
            }

            // ref_type خرید
            if ($j->ref_type === 'parchase') {
                // خرید همراه با supplier
                $parchase = Parchase::with('supplier')->find($j->ref_id);

                if ($parchase) {
                    // اگر حمایت‌کننده تعریف شده باشد
                    $j->full_name = $parchase->supplier->full_name ?? null;
                    $j->display_name = $parchase->supplier->full_name ?? "خرید شماره {$j->ref_id}";
                } else {
                    $j->display_name = "خرید شماره {$j->ref_id}";
                }
            }

            return $j;
        });

        return response()->json($journals);
    }

    /**
     * دریافت لیست ثبت‌نام‌ها
     */
    public function registrations(Request $request)
    {
        $query = Registrations::query();
        if ($request->filled('type')) $query->where('reg_type', $request->type);

        return response()->json(
            $query->select('reg_id', 'full_name', 'reg_type')->get()
        );
    }

    /**
     * ذخیره ژورنال جدید
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'journal_date' => 'required|date',
            'description'  => 'nullable|string|max:1000',
            'entry_type'   => ['required', Rule::in(['debit','credit'])],
            'amount'       => 'required|numeric|min:0.01',
            'ref_type'     => 'required|string',
            'ref_id'       => 'required|integer',
        ]);

        // بررسی وجود رفرنس
        $exists = Registrations::where('reg_type', $validated['ref_type'])
            ->where('reg_id', $validated['ref_id'])
            ->exists();

        if (! $exists && !in_array($validated['ref_type'], ['sale','parchase'])) {
            return response()->json(['message' => 'رویداد انتخاب‌شده معتبر نیست.'], 422);
        }

        $journal = Journal::create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'ژورنال با موفقیت ذخیره شد.',
            'journal' => $journal
        ], 201);
    }
}
