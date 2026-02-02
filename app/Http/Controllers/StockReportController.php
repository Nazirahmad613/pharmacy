<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Stock_Report;
use Illuminate\Support\Facades\DB;


class StockReportController extends Controller
{
   public function index(){

        $rows = DB::table('stock_Report')->get();
        return response()->json($rows);

   }


}
