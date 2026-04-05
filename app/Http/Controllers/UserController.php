<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::all());
    }




    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => 'required|in:user,admin,hospital_head,super_admin'
        ]);

        $validated['password'] = Hash::make($validated['password']);
        

        $user = User::create($validated);

        return response()->json($user, 201);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:6',
            'role' => 'sometimes|required|string'
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        $currentUser = auth()->user();

        // محدود کردن حذف برای hospital_head
        if ($currentUser->role === 'hospital_head') {
            return response()->json(['message' => 'دسترسی ندارید'], 403);
        }

        // حذف کاربر
        $user->delete();

        return response()->json([
            'message' => 'حذف شد'
        ]);
    }
}