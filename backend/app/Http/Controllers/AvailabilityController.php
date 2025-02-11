<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Availability;

class AvailabilityController extends Controller
{
    public function index()
    {
        $availabilities = Availability::with("employee")->get();
        return view('welcom', compact('availabilities'));
    }

}
