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

        if ($request->filled('type')) {
            $query->where('entry_type', $request->type);
        }

        if ($request->filled('from')) {
            $query->whereDate('journal_date', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('journal_date', '<=', $request->to);
        }

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
        return response()->json(
            $journal->load('user', 'registration')
        );
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
            'journal' => $journal->load('registration')
        ], 201);
    }

    /* =========================
       ویرایش ژورنال
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
       حذف
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
       لیست registrations
    ========================= */
    public function registrations(Request $request)
    {
        $query = Registrations::query();

        if ($request->filled('type')) {
            $query->where('reg_type', $request->type);
        }

        return response()->json(
            $query->select('reg_id', 'full_name', 'reg_type')->get()
        );
    }
}
