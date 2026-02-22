<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccountSummaryController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('account_summary');

        /*
        |--------------------------------------------------------------------------
        | 🔎 Search (نام حساب)
        |--------------------------------------------------------------------------
        */
        if ($request->filled('search')) {
            $search = trim($request->search);

            $query->where(function ($q) use ($search) {
                $q->where('account_name', 'like', "%{$search}%")
                  ->orWhere('account_type', 'like', "%{$search}%");
            });
        }

        /*
        |--------------------------------------------------------------------------
        | 🎯 Filters
        |--------------------------------------------------------------------------
        */

        // فیلتر نوع حساب
        if ($request->filled('account_type')) {
            $query->where('account_type', $request->account_type);
        }

        // فیلتر حداقل بیلانس
        if ($request->filled('min_balance')) {
            $query->where('balance', '>=', $request->min_balance);
        }

        // فقط بدهکارها
        if ($request->filled('only_debtors') && $request->only_debtors == 1) {
            $query->where('balance', '>', 0);
        }

        // فقط طلبکارها
        if ($request->filled('only_creditors') && $request->only_creditors == 1) {
            $query->where('balance', '<', 0);
        }

        /*
        |--------------------------------------------------------------------------
        | 🔄 Sorting
        |--------------------------------------------------------------------------
        */
        $sortBy = $request->get('sort_by', 'account_type');
        $sortDir = $request->get('sort_dir', 'asc');

        $allowedSorts = [
            'account_type',
            'account_name',
            'total_debit',
            'total_credit',
            'balance'
        ];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        }

        /*
        |--------------------------------------------------------------------------
        | 📄 Pagination
        |--------------------------------------------------------------------------
        */
        $perPage = $request->get('per_page', 10);

        return response()->json(
            $query->paginate($perPage)
        );
    }
}