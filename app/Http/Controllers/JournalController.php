<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use App\Models\Registrations;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class JournalController extends Controller
{
    /* =========================
       لیست ژورنال‌ها
    ========================= */
    public function index(Request $request)
{
    $query = Journal::with('registration', 'user');

    // فیلتر نوع ثبت (entry_type)
    if ($request->filled('type')) {
        $query->where('entry_type', $request->type);
    }

    // فیلتر تاریخ
    if ($request->filled('from')) {
        $query->whereDate('journal_date', '>=', $request->from);
    }
    if ($request->filled('to')) {
        $query->whereDate('journal_date', '<=', $request->to);
    }

    // فیلتر بر اساس نوع رویداد و نام منبع
    if ($request->filled('ref_type')) {
        $query->where('ref_type', $request->ref_type);
    }
    if ($request->filled('ref_id')) {
        $query->where('ref_id', $request->ref_id);
    }

    return response()->json(
        $query->orderBy('journal_date', 'desc')->get()
    );
}


    /* =========================
       نمایش یک ژورنال
    ========================= */
    public function show(Journal $journal)
    {
        $journal->load('user', 'registration');

        return response()->json($journal);
    }

    /* =========================
       ثبت ژورنال جدید
    ========================= */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'journal_date' => 'required|date',
            'description'  => 'nullable|string|max:1000',
            'entry_type'   => ['required', Rule::in(['debit', 'credit'])],
            'amount'       => 'required|numeric|min:0.01',
            'ref_type'     => 'required|string',
            'ref_id'       => 'required|integer',
        ]);

        // بررسی صحت ref_type و ref_id در جدول registrations
        $exists = Registrations::where('reg_type', $validated['ref_type'])
            ->where('reg_id', $validated['ref_id'])
            ->exists();

        if (! $exists) {
            return response()->json([
                'message' => 'رویداد انتخاب‌شده معتبر نیست.'
            ], 422);
        }

        $journal = Journal::create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'ژورنال با موفقیت ذخیره شد.',
            'journal' => $journal->load('registration') // نام کامل ثبت‌نام برای نمایش
        ], 201);
    }

    /* =========================
       بروزرسانی ژورنال
    ========================= */
    public function update(Request $request, Journal $journal)
    {
        $validated = $request->validate([
            'journal_date' => 'required|date',
            'description'  => 'nullable|string|max:1000',
            'entry_type'   => ['required', Rule::in(['debit', 'credit'])],
            'amount'       => 'required|numeric|min:0.01',
            'ref_type'     => 'required|string',
            'ref_id'       => 'required|integer',
        ]);

        $exists = Registrations::where('reg_type', $validated['ref_type'])
            ->where('reg_id', $validated['ref_id'])
            ->exists();

        if (! $exists) {
            return response()->json([
                'message' => 'رویداد انتخاب‌شده معتبر نیست.'
            ], 422);
        }

        $journal->update($validated);

        return response()->json([
            'message' => 'ژورنال با موفقیت بروزرسانی شد.',
            'journal' => $journal->load('registration')
        ]);
    }

    /* =========================
       حذف ژورنال
    ========================= */
    public function destroy(Journal $journal)
    {
        $journal->delete();

        return response()->json([
            'message' => 'ژورنال با موفقیت حذف شد.'
        ]);
    }

    /* =========================
       مانده کل
    ========================= */
    public function balance()
    {
        $balance = Journal::selectRaw("
            SUM(
                CASE
                    WHEN entry_type = 'credit' THEN amount
                    ELSE -amount
                END
            ) as balance
        ")->value('balance');

        return response()->json([
            'balance' => $balance ?? 0
        ]);
    }

    /* =========================
       لیست registrations برای select
       با full_name
    ========================= */
    public function registrations(Request $request)
    {
        $query = Registrations::query();

        if ($request->filled('type')) {
            $query->where('reg_type', $request->type); // فقط از reg_type استفاده شود
        }

        // فقط ستون‌های لازم: reg_id و full_name
        $registrations = $query->select('reg_id', 'full_name', 'reg_type')->get();

        return response()->json($registrations);

$exists = Registrations::where('reg_id', $validated['ref_id'])
    ->where('reg_type', $validated['ref_type']) // شرط اینجا باشد
    ->exists();

if (!$exists) {
    return response()->json([
        'message' => 'رویداد انتخاب‌شده معتبر نیست.'
    ], 422);
}

$journal = Journal::create([
    ...$validated,
    'user_id' => Auth::id(),
]);

// فقط اینجا eager load بدون شرط مشکل‌ساز
return response()->json([
    'message' => 'ژورنال با موفقیت ذخیره شد.',
    'journal' => $journal->load('registration') // بدون شرط اضافی
], 201);








    }
}
