<?php
namespace App\Http\Controllers;

use App\Models\Opp;

class OppController extends Controller
{
    public function index()
    {
        $opps = Opp::all();
        return view('opp.index', compact('opps'));
    }
}

