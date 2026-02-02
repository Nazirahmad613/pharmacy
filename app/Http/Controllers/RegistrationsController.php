<?php

namespace App\Http\Controllers;

use App\Models\Registrations;
use Illuminate\Http\Request;

class RegistrationsController extends Controller
{
    // 📥 ثبت
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reg_type'   => 'required|string',
            'full_name'  => 'required|string|max:255',
            'father_name'=> 'nullable|string|max:255',
            'phone'      => 'nullable|string|max:50',
            'gender'     => 'nullable|string',
            'age'        => 'nullable|integer',
            'blood_group'=> 'nullable|string|max:10',
            'address'    => 'nullable|string',
            'visit_date' => 'nullable|date',
            'note'       => 'nullable|string',
        ]);

        $data = Registrations::create($validated);

        return response()->json([
            'message' => 'ثبت موفقانه انجام شد',
            'data' => $data
        ], 201);
    }

    // 📤 لیست
    public function index(Request $request)
    {
        $query = Registrations::query();

        if ($request->filled('reg_type')) {
            $query->where('reg_type', $request->reg_type);
        }

        return response()->json(
            $query->orderBy('reg_id', 'desc')->get()
        );
    }
}
