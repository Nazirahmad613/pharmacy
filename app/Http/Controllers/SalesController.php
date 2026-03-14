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
            'id'            => $sale->sales_id,
            'sales_date'    => $sale->sales_date,
            'cust_id'       => $sale->cust_id,
            'tazkira_number'=> $sale->tazkira_number,

            'customer_name' => $sale->customer->full_name ?? '-',

            'total_sales'   => $sale->total_sales,
            'discount'      => $sale->discount,
            'net_sales'     => $sale->net_sales,
            'total_paid'    => $sale->total_paid,
            'remaining'     => $sale->remaining_amount,
            'payment_status'=> $sale->payment_status,

            'items' => $sale->items->map(function ($item) {
                return [
                    'sales_it_id'  => $item->sales_it_id,
                    'med_id'       => $item->med_id,
                    'category_id'  => $item->category_id,
                    'supplier_id'  => $item->supplier_id,

                    'med_name'     => $item->medication->gen_name ?? '-',
                    'category_name'=> $item->category->category_name ?? '-',
                    'supplier_name'=> $item->supplier->full_name ?? '-',

                    'type'         => $item->type,
                    'quantity'     => $item->quantity,
                    'unit_sales'   => $item->unit_sales,
                    'total_sales'  => $item->total_sales,
                ];
            }),
        ];
    });

    return response()->json($sales);
}

public function store(Request $request)
{
    DB::beginTransaction();

    try {

        $totalSales = collect($request->items)
            ->sum(fn($i) => $i['quantity'] * $i['unit_sales']);

        $discount = $request->discount ?? 0;
        $netSales = $totalSales - $discount;
        $totalPaid = min($request->total_paid ?? 0, $netSales);

        $sale = Sales::create([
            'sales_date'  => $request->sales_date,
            'cust_id'     => $request->cust_id,
            'tazkira_number'=> $request->tazkira_number,
            'total_sales' => $totalSales,
            'discount'    => $discount,
            'net_sales'   => $netSales,
            'total_paid'  => $totalPaid,
            'sales_user'  => Auth::id(),
        ]);

        foreach ($request->items as $item) {

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

        $this->saveJournal($sale->sales_id,$request->cust_id,$netSales,$totalPaid,$request->sales_date);

        DB::commit();
return response()->json([
    'message' => 'Sale saved successfully',
    'sale_id' => $sale->sales_id
], 201);

    } catch (\Exception $e) {

        DB::rollBack();

        return response()->json([
            'message'=>'Server Error',
            'error'=>$e->getMessage()
        ],500);
    }
}

public function update(Request $request,$sales_id)
{
    DB::beginTransaction();

    try {

        $sale = Sales::with('items')
            ->where('sales_id',$sales_id)
            ->firstOrFail();

        $totalSales = collect($request->items)
            ->sum(fn($i) => $i['quantity'] * $i['unit_sales']);

        $discount = $request->discount ?? 0;
        $netSales = $totalSales - $discount;
        $totalPaid = min($request->total_paid ?? 0,$netSales);

        $sale->items()->delete();

        foreach ($request->items as $item) {

            $sale->items()->create([
                'med_id'=>$item['med_id'],
                'supplier_id'=>$item['supplier_id'],
                'category_id'=>$item['category_id'],
                'type'=>$item['type'],
                'quantity'=>$item['quantity'],
                'unit_sales'=>$item['unit_sales'],
                'total_sales'=>$item['quantity']*$item['unit_sales'],
            ]);
        }

        $sale->update([
            'sales_date'=>$request->sales_date,
            'cust_id'=>$request->cust_id,
            'tazkira_number'=>$request->tazkira_number,
            'total_sales'=>$totalSales,
            'discount'=>$discount,
            'net_sales'=>$netSales,
            'total_paid'=>$totalPaid,
        ]);

        // حذف ژورنال قبلی
        Journal::where('ref_type','sale')
            ->where('ref_id',$sales_id)
            ->delete();

        // ثبت ژورنال جدید
        $this->saveJournal($sales_id,$request->cust_id,$netSales,$totalPaid,$request->sales_date);

        DB::commit();

        return response()->json(['message'=>'Sale updated successfully']);

    } catch (\Exception $e) {

        DB::rollBack();

        return response()->json([
            'message'=>'Server Error',
            'error'=>$e->getMessage()
        ],500);
    }
}

public function destroy($sales_id)
{
    DB::beginTransaction();

    try {

        $sale = Sales::with('items')
            ->where('sales_id',$sales_id)
            ->firstOrFail();

        $sale->items()->delete();

        Journal::where('ref_type','sale')
            ->where('ref_id',$sales_id)
            ->delete();

        $sale->delete();

        DB::commit();

        return response()->json(['message'=>'Sale deleted successfully']);

    } catch (\Exception $e) {

        DB::rollBack();

        return response()->json([
            'message'=>'Server Error',
            'error'=>$e->getMessage()
        ],500);
    }
}

private function saveJournal($saleId,$custId,$netSales,$totalPaid,$date)
{

    Journal::create([
        'journal_date'=>$date,
        'description'=>'ثبت فروش',
        'entry_type'=>'credit',
        'amount'=>$netSales,
        'ref_type'=>'sale',
        'ref_id'=>$saleId,
        'cust_id'=>$custId,
        'user_id'=>Auth::id(),
    ]);

    if($totalPaid>0){

        Journal::create([
            'journal_date'=>$date,
            'description'=>'دریافت وجه فروش',
            'entry_type'=>'debit',
            'amount'=>$totalPaid,
            'ref_type'=>'sale',
            'ref_id'=>$saleId,
            'cust_id'=>$custId,
            'user_id'=>Auth::id(),
        ]);
    }
}

}