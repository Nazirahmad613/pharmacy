<?php


namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DoctorController extends Controller
{
    public function index()
    {
        return response()->json([
            'doctors' => Doctor::all()
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'doc_name' => 'required|string|max:255',
                'doc_last_name' => 'required|string|max:255',
                'doc_section' => 'required|string|max:255',
                'doc_phone' => 'required|numeric',
                'doc_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($request->hasFile('doc_image')) {
                $file = $request->file('doc_image');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('images/doctors', $filename, 'public'); 
                $validatedData['doc_image'] = 'storage/' . $path; 
            } else {
                $validatedData['doc_image'] = null; 
            }

            $doctor = Doctor::create($validatedData);

            return response()->json(['message' => 'داکتر با موفقیت ثبت شد', 'doctor' => $doctor], 201);

        } catch (\Exception $e) {
            Log::error("Error in Doctor Store: " . $e->getMessage());
            return response()->json(['error' => 'مشکلی در سرور رخ داده است', 'message' => $e->getMessage()], 500);
        }
    }

    
}
