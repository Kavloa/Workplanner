<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|unique:users|max:255',
            'password' => 'required|min:6',
        ]);

        $user = new User();
        $user->username = $validated['username'];
        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json(['message' => 'User registered successfully'], 201);
    }
    public function login(Request $request)
    {
        // Retrieve the input data
        $username = $request->input('username');
        $password = $request->input('password');
    
        // Check if the user exists in the database
        $user = User::where('username', $username)->first();
    
        if (!$user) {
            // User does not exist
            return response()->json(['message' => 'Invalid credentials'], 401);
    }
        // User exists, return user data
        return response()->json(['message' => 'Login successful' , 'user' => $user]);
    }
    
    }
