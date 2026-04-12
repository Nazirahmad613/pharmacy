<?php

namespace App\Http\Controllers;
 use Spatie\Permission\Models\Role;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
 public function index()
{
    return response()->json(
        User::with('roles', 'permissions')->get()
    );
}

public function store(Request $request)
{
    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
    ]);

    $user->assignRole($request->role);

    return $user->load('roles', 'permissions');
}

public function update(Request $request, User $user)
{
    $user->update([
        'name' => $request->name ?? $user->name,
        'email' => $request->email ?? $user->email,
    ]);

    if ($request->role) {
        $user->syncRoles([$request->role]);
    }

    if ($request->permissions) {
        $user->syncPermissions($request->permissions);
    }

    return $user->load('roles', 'permissions');
}

public function destroy(User $user)
{
    $user->delete();

    return response()->json(['message' => 'deleted']);
}


 
}