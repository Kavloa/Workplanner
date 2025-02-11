<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class dbtest extends Controller
{
    public function testConnection()
    {
        try {
            // Attempt to retrieve employee names from the database
            $employeeNames = DB::table('employees')->pluck('name');
            
            // Return the names in a JSON response
            return response()->json(['status' => 'success', 'data' => $employeeNames]);
        } catch (\Exception $e) {
            // If there is an error, catch it and return the error message
            return response()->json(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
