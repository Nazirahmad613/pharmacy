<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccountSummaryController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('account_summary_view');

        // فیلتر نوع حساب
        if ($request->filled('account_type')) {
            $query->where('account_type', $request->account_type);
        }

        // جستجو حرفه‌ای
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('account_name', 'like', "%{$search}%")
                  ->orWhere('medications', 'like', "%{$search}%");
            });
        }

        // فیلتر بازه تاریخ (اختیاری)
        if ($request->filled('from_date')) {
            $query->whereDate('last_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('last_date', '<=', $request->to_date);
        }

        // مرتب سازی
        $query->orderBy('last_date', 'desc');

        // اگر pagination خواستی
        if ($request->filled('per_page')) {
            return response()->json(
                $query->paginate($request->per_page)
            );
        }

        return response()->json($query->get());
    }
}
