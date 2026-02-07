<?php

namespace App\Http\Controllers;

use App\Models\Sales;
use App\Models\Journal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class SalesController extends Controller
{
    public function index()
    {
        // لود فروش‌ها همراه با آیتم‌ها و مشتری (حمایت‌کننده‌ها از جدول registrations با reg_type = 'supplier')
        $sales = Sales::with([
            'items.medication',
            'items.category',
            'items.supplier' => function ($query) {
                $query->where('reg_type', 'supplier');
            },
            'customer'
        ])->get();

        return response()->json($sales);
    }

    public function store(Request $request)
    {
        // اعتبارسنجی داده‌ها
        $validated = $request->validate([
            'sales_date' => 'required|date',
            'cust_id' => 'required|exists:registrations,reg_id',
            'discount'   => 'nullable|numeric|min:0',
            'total_paid' => 'nullable|numeric|min:0',

            'items'                  => 'required|array|min:1',
            'items.*.med_id'         => 'required|exists:medications,med_id',
            'items.*.supplier_id'    => 'required|exists:registrations,reg_id', // ✅ اصلاح به registrations
            'items.*.category_id'    => 'required|exists:categories,category_id',
            'items.*.type'           => 'required|string',
            'items.*.quantity'       => 'required|integer|min:1',
            'items.*.unit_sales'     => 'required|numeric|min:0',
            'items.*.exp_date'       => 'required|date',
        ]);

        DB::beginTransaction();

        try {
            // محاسبه مجموع فروش از آیتم‌ها
            $totalSales = collect($validated['items'])->sum(function($item) {
                return $item['quantity'] * $item['unit_sales'];
            });

            $discount = $validated['discount'] ?? 0;
            $netSales = $totalSales - $discount;

            if ($netSales < 0) {
                throw new \Exception('Net sales cannot be negative');
            }

            // پرداخت ثبت شده
            $totalPaid = $validated['total_paid'] ?? 0;
            if ($totalPaid > $netSales) {
                $totalPaid = $netSales;
            }

            // ذخیره فروش
            $sale = Sales::create([
                'sales_date'  => $validated['sales_date'],
                'cust_id'     => $validated['cust_id'], 
                'total_sales' => $totalSales,
                'discount'    => $discount,
                'net_sales'   => $netSales,
                'total_paid'  => $totalPaid,
                'sales_user'  => Auth::id(),
            ]);

            // ذخیره آیتم‌ها
            foreach ($validated['items'] as $item) {
                $sale->items()->create([
                    'med_id'      => $item['med_id'],
                    'supplier_id' => $item['supplier_id'], // ✅ از جدول registrations با reg_type = supplier
                    'category_id' => $item['category_id'],
                    'type'        => $item['type'],
                    'quantity'    => $item['quantity'],
                    'unit_sales'  => $item['unit_sales'],
                    'total_sales' => $item['quantity'] * $item['unit_sales'],
                    'exp_date'    => $item['exp_date'],
                ]);
            }

            // ثبت خودکار ژورنال
            Journal::create([
                'journal_date' => $sale->sales_date,
                'description'  => 'ثبت فروش',
                'debit'        => $netSales,
                'credit'       => 0,
                'ref_type'     => 'sale',
                'ref_id'       => $sale->sales_id,
                'user_id'      => Auth::id(),
            ]);

            if ($totalPaid > 0) {
                Journal::create([
                    'journal_date' => $sale->sales_date,
                    'description'  => 'دریافت وجه فروش',
                    'debit'        => 0,
                    'credit'       => $totalPaid,
                    'ref_type'     => 'payment_in',
                    'ref_id'       => $sale->sales_id,
                    'user_id'      => Auth::id(),
                ]);
            }

            DB::commit();

            return response()->json([
                'message'        => 'Sale saved successfully',
                'sale_id'        => $sale->sales_id,
                'total_sales'    => $totalSales,
                'discount'       => $discount,
                'net_sales'      => $netSales,
                'total_paid'     => $totalPaid,
                'remaining'      => $sale->remaining_amount,
                'payment_status' => $sale->payment_status,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Sale store error', [
                'error'   => $e->getMessage(),
                'request' => $request->all(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'message' => 'Server Error',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
