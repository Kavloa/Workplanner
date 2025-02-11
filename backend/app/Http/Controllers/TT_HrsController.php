<?php

namespace App\Http\Controllers;

use App\Models\TT_Hrs;
use Illuminate\Http\Request;

class TT_HrsController extends Controller
{
    // Display a listing of the resource.
    public function index()
    {
        $tt_hrs = TT_Hrs::all();
        return view('tt_hrs.index', compact('tt_hrs'));
    }

    // Show the form for creating a new resource.
    public function create()
    {
        return view('tt_hrs.create');
    }

    // Store a newly created resource in storage.
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'employee_id' => 'required',
            'date' => 'required|date',
            'hours_worked' => 'required|numeric',
            // Validate other fields as necessary
        ]);

        TT_Hrs::create($validatedData);

        return redirect()->route('tt_hrs.index')->with('success', 'Record created successfully.');
    }

    // Display the specified resource.
    public function show(TT_Hrs $tt_hrs)
    {
        return view('tt_hrs.show', compact('tt_hrs'));
    }

    // Show the form for editing the specified resource.
    public function edit(TT_Hrs $tt_hrs)
    {
        return view('tt_hrs.edit', compact('tt_hrs'));
    }

    // Update the specified resource in storage.
    public function update(Request $request, TT_Hrs $tt_hrs)
    {
        $validatedData = $request->validate([
            'employee_id' => 'required',
            'date' => 'required|date',
            'hours_worked' => 'required|numeric',
            // Validate other fields as necessary
        ]);

        $tt_hrs->update($validatedData);

        return redirect()->route('tt_hrs.index')->with('success', 'Record updated successfully.');
    }

    // Remove the specified resource from storage.
    public function destroy(TT_Hrs $tt_hrs)
    {
        $tt_hrs->delete();

        return redirect()->route('tt_hrs.index')->with('success', 'Record deleted successfully.');
    }
}
