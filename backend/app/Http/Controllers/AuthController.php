<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Handle login requests.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        return response()->json([
            $request
        ]);
        
        // $request->validate([
        //     'username' => 'required|string',
        //     'password' => 'required|string',
        // ]);

        // $credentials = $request->only('username', 'password');

        // if (Auth::attempt($credentials)) {
        //     // Authentication passed
        //     $user = Auth::user();
        //     return response()->json([
        //         'success' => true,
        //         'message' => 'Login successful',
        //         'user' => $user
        //     ]);
        // } else {
        //     // Authentication failed
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Invalid credentials'
        //     ], 401);
        //}
    }
}
