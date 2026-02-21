<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use App\Models\Registrations;
use App\Models\Sales;
use App\Models\Parchase;
use App\Models\Prescription;
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
            $j->total_amount = null;
            $j->paid_amount = null;
            $j->due_amount = null;

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
                $sale = Sales::with('customer')->find($j->ref_id);

                if ($sale) {
                    $j->full_name = $sale->customer->full_name ?? null;
                    $j->display_name = $sale->customer->full_name ?? "فروش شماره {$j->ref_id}";

                    $j->total_amount = $sale->net_sales;
                    $j->paid_amount  = $sale->total_paid;
                    $j->due_amount   = $sale->remaining_amount;
                } else {
                    $j->display_name = "فروش شماره {$j->ref_id}";
                }
            }

            // ref_type خرید
            if ($j->ref_type === 'parchase') {
                $parchase = Parchase::with('supplier')->find($j->ref_id);

                if ($parchase) {
                    $j->full_name = $parchase->supplier->full_name ?? null;
                    $j->display_name = $parchase->supplier->full_name ?? "خرید شماره {$j->ref_id}";

                    $j->total_amount = $parchase->total_parchase;
                    $j->paid_amount  = $parchase->par_paid;
                    $j->due_amount   = $parchase->due_par;
                } else {
                    $j->display_name = "خرید شماره {$j->ref_id}";
                }
            }

            // ref_type نسخه‌ها
            if ($j->ref_type === 'patient' && $j->pres_id) {
                $prescription = Prescription::find($j->pres_id);

                if ($prescription) {
                    $j->full_name    = $prescription->patient_name;
                    $j->display_name = "نسخه شماره {$prescription->pres_num}";
                    $j->total_amount = $prescription->net_amount;
                    $j->paid_amount  = $prescription->net_amount; // کل مبلغ پرداخت شده
                    $j->due_amount   = 0;                         // باقی‌مانده صفر
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
            'pres_id'      => 'nullable|integer', // ✅ اضافه شد
        ]);

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