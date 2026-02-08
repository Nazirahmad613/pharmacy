<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class JournalController extends Controller
{
  public function index(Request $request)
{
    $query = Journal::query();

    // فیلتر بر اساس نوع
    if ($request->has('type') && $request->type) {
        $query->where('ref_type', $request->type);
    }

    // فیلتر تاریخ
    if ($request->has('from') && $request->from) {
        $query->whereDate('journal_date', '>=', $request->from);
    }
    if ($request->has('to') && $request->to) {
        $query->whereDate('journal_date', '<=', $request->to);
    }

    // مرتب‌سازی تاریخ وار
    $query->orderBy('journal_date', 'desc');

    // paginate یا تمام رکوردها
    return response()->json($query->get());
}
     
    public function show(Journal $journal)
    {
        $journal->load('user', 'reference');
        return response()->json($journal);
    }

    /**
     * ذخیره ژورنال جدید
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'journal_date' => 'required|date',
            'description'  => 'nullable|string|max:1000',
            'debit'        => 'nullable|numeric|min:0',
            'credit'       => 'nullable|numeric|min:0',
            'ref_type'     => ['nullable', Rule::in(Journal::TYPES)],
            'ref_id'       => 'nullable|integer',
        ]);

        // بررسی صحت رکورد (debit یا credit باید ثبت شود)
        if (($validated['debit'] ?? 0) > 0 && ($validated['credit'] ?? 0) > 0) {
            return response()->json([
                'message' => 'فقط یکی از مقادیر debit یا credit باید بزرگتر از صفر باشد.'
            ], 422);
        }

        $journal = Journal::create(array_merge(
            $validated,
            ['user_id' => Auth::id() ?? null]
        ));

        return response()->json([
            'message' => 'ژورنال با موفقیت ذخیره شد.',
            'journal' => $journal
        ], 201);
    }

    /**
     * بروزرسانی ژورنال
     */
    public function update(Request $request, Journal $journal)
    {
        $validated = $request->validate([
            'journal_date' => 'required|date',
            'description'  => 'nullable|string|max:1000',
            'debit'        => 'nullable|numeric|min:0',
            'credit'       => 'nullable|numeric|min:0',
            'ref_type'     => ['nullable', Rule::in(Journal::TYPES)],
            'ref_id'       => 'nullable|integer',
        ]);

        if (($validated['debit'] ?? 0) > 0 && ($validated['credit'] ?? 0) > 0) {
            return response()->json([
                'message' => 'فقط یکی از مقادیر debit یا credit باید بزرگتر از صفر باشد.'
            ], 422);
        }

        $journal->update($validated);

        return response()->json([
            'message' => 'ژورنال با موفقیت بروزرسانی شد.',
            'journal' => $journal
        ]);
    }

    /**
     * حذف ژورنال
     */
    public function destroy(Journal $journal)
    {
        $journal->delete();

        return response()->json([
            'message' => 'ژورنال با موفقیت حذف شد.'
        ]);
    }

    /**
     * دریافت مانده کل ژورنال‌ها
     */
    public function balance()
    {
        $balance = Journal::sum('credit') - Journal::sum('debit');

        return response()->json([
            'balance' => $balance
        ]);
    }
}
