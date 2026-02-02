<?php
    
namespace App\Http\Controllers;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    // public function supp()
    // {
    //     $suppliers = Supplier::all(); // دریافت تمام تأمین‌کنندگان
    //     return view('view_sup', compact('suppliers'));
    // }

            
    public function index()
    {
        return response()->json([
            'suppliers' => Supplier::all()
        ]);

    }






    public function suppliersByMedication($med_id)
{
    return Supplier::whereHas('medications', function ($q) use ($med_id) {
        $q->where('med_id', $med_id);
    })
    ->select('supplier_id', 'supplier_name')
    ->get();
}
        
public function store(Request $request)
{
    try {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'cont_person' => 'required|string|max:255',
            'phone_num' => 'required|string|max:15',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        $supplier = Supplier::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'شرکت سازنده دوا با موفقیت ثبت شد',
            'supplier' => $supplier
        ], 201);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'خطای سرور: ' . $e->getMessage()
        ], 500);
    }
}







    public function supp_view(){

            $suppli = Supplier::orderBy('supplier_id', 'desc')->paginate(10);
            return view('view_sup', compact('suppli'));


    }
   

    public function supplier_insert(){

        return view('supplier_insert');
    }

    public function supp_store(Request $request){
        
        $request->validate([
            'name' => 'required|string|max:255',
            'cont_person' => 'required|string|max:255',
            'phone_num' => 'required|string|max:15',
            'email' => 'required|email|max:255',
            'address' => 'nullable|string|max:255',
        ]);
    
        
        $supplier = new Supplier;  
        $supplier->name = $request->name;
        $supplier->cont_person = $request->cont_person;
        $supplier->phone_num = $request->phone_num;
        $supplier->email = $request->email;
        $supplier->address = $request->address;
        $supplier->save();

        return redirect('/supp_view')->with('mes', 'معلومات موفقانه ثبت گردید');
    }

    
    
        public function suppliers_edit($supplier_id)
        {
            $supplier = Supplier::where('supplier_id', $supplier_id)->firstOrFail(); 
            return view('supplier_edit', compact('supplier'));
        }
         
     
        public function suppliers_update(Request $request, $supplier_id)
        {
            
            $request->validate([
                'name' => 'required|string|max:255',
                'cont_person' => 'required|string|max:255',
                'phone_num' => 'required|string|max:20',
                'email' => 'nullable|email|max:255',
                'address' => 'nullable|string|max:500',
            ]);
        
            try { 
                $supplier = Supplier::findOrFail($supplier_id);
        
              
                $supplier->update([
                    'name' => $request->name,
                    'cont_person' => $request->cont_person,
                    'phone_num' => $request->phone_num,
                    'email' => $request->email,
                    'address' => $request->address,
                ]);
        
                return redirect()->route('supp_view')->with('success', 'اطلاعات با موفقیت ویرایش شد.');
        
            } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
                return redirect()->route('supp_view')->with('error', 'تأمین‌کننده موردنظر یافت نشد.');
            } catch (\Exception $e) {
                return redirect()->route('supp_view')->with('error', 'خطایی رخ داده است: ' . $e->getMessage());
            }
        }

 

        public function destroy($supplier_id)
{
    $suppl = Supplier::findOrFail($supplier_id); // بررسی وجود رکورد
    $suppl->delete(); // حذف کردن
    return redirect()->route('supp_view')->with('del', 'اطلاعات با موفقیت حذف گردید');
}







    }