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
        $sales = Sales::with([
            'customer',
            'items.supplier',
            'items.medication',
            'items.category',
        ])->get()->map(function ($sale) {
            return [
                'id'            => $sale->sales_id, // مهم: id با ref_id در Journal هماهنگ است
                'sales_date'    => $sale->sales_date,
                'customer_name' => $sale->customer->full_name ?? '-',
                'total_sales'   => $sale->total_sales,
                'discount'      => $sale->discount,
                'net_sales'     => $sale->net_sales,
                'total_paid'    => $sale->total_paid,
                'remaining'     => $sale->remaining_amount,
                'payment_status'=> $sale->payment_status,
                'items'         => $sale->items->map(function($item) {
                    return [
                        'med_id'        => $item->med_id,
                        'med_name'      => $item->medication->med_name ?? '-',
                        'category_name' => $item->category->category_name ?? '-',
                        'supplier_name' => $item->supplier->full_name ?? '-',
                        'type'          => $item->type,
                        'quantity'      => $item->quantity,
                        'unit_sales'    => $item->unit_sales,
                        'total_sales'   => $item->total_sales,
                      
                    ];
                }),
            ];
        });

        return response()->json($sales);
    }
public function store(Request $request)
{
    $validated = $request->validate([
        'sales_date' => 'required|date',
        'cust_id' => 'required|exists:registrations,reg_id',
        'customer_nid' => 'nullable|string', // ✅ اضافه شد
        'discount' => 'nullable|numeric|min:0',
        'total_paid' => 'nullable|numeric|min:0',
        'items' => 'required|array|min:1',
        'items.*.med_id' => 'required|exists:medications,med_id',
        'items.*.supplier_id' => 'required|exists:registrations,reg_id',
        'items.*.category_id' => 'required|exists:categories,category_id',
        'items.*.type' => 'required|string',
        'items.*.quantity' => 'required|integer|min:1',
        'items.*.unit_sales' => 'required|numeric|min:0',
    ]);

    DB::beginTransaction();

    try {
        $totalSales = collect($validated['items'])->sum(fn($item) => $item['quantity'] * $item['unit_sales']);
        $discount = $validated['discount'] ?? 0;
        $netSales = $totalSales - $discount;
        if ($netSales < 0) throw new \Exception('Net sales cannot be negative');
        $totalPaid = min($validated['total_paid'] ?? 0, $netSales);

        // 🔹 ذخیره فروش با شماره تذکره مشتری
        $sale = Sales::create([
            'sales_date'  => $validated['sales_date'],
            'cust_id'     => $validated['cust_id'],
            'customer_nid'=> $validated['customer_nid'], // ✅ اضافه شد
            'total_sales' => $totalSales,
            'discount'    => $discount,
            'net_sales'   => $netSales,
            'total_paid'  => $totalPaid,
            'sales_user'  => Auth::id(),
        ]);

        foreach ($validated['items'] as $item) {
            $sale->items()->create([
                'med_id'      => $item['med_id'],
                'supplier_id' => $item['supplier_id'],
                'category_id' => $item['category_id'],
                'type'        => $item['type'],
                'quantity'    => $item['quantity'],
                'unit_sales'  => $item['unit_sales'],
                'total_sales' => $item['quantity'] * $item['unit_sales'],
            ]);
        }

        // 🔹 ثبت ژورنال فروش با شماره تذکره مشتری
        Journal::create([
            'journal_date' => $sale->sales_date,
            'description'  => 'ثبت فروش',
            'entry_type'   => Journal::ENTRY_CREDIT,
            'amount'       => $netSales,
            'ref_type'     => 'sale',
            'ref_id'       => $sale->sales_id,
            'user_id'      => Auth::id(),
            'customer_nid' => $sale->customer_nid, // ✅ اضافه شد
            'customer_name'=> $sale->customer->full_name ?? '-', // نام مشتری
        ]);

        if ($totalPaid > 0) {
            Journal::create([
                'journal_date' => $sale->sales_date,
                'description'  => 'دریافت وجه فروش',
                'entry_type'   => Journal::ENTRY_DEBIT,
                'amount'       => $totalPaid,
                'ref_type'     => 'sale',
                'ref_id'       => $sale->sales_id,
                'user_id'      => Auth::id(),
                'customer_nid' => $sale->customer_nid, // ✅ اضافه شد
                'customer_name'=> $sale->customer->full_name ?? '-', 
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
            'error' => $e->getMessage(),
            'request' => $request->all(),
            'user_id' => Auth::id()
        ]);
        return response()->json(['message'=>'Server Error','error'=>$e->getMessage()], 500);
    }
}
 
}
