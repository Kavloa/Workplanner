<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Nrm;
use Illuminate\Http\Request;

class NrmController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nrmNumber' => 'required|string|max:255|unique:nrm,number',
        ]);

        $nrm = new Nrm();
        $nrm->number = $request->nrmNumber;
        $nrm->save();

        return response()->json(['success' => true, 'message' => 'NRM Section added successfully'], 201);
    }
    public function getall(Request $request)
    {
       $nrm = Nrm::all();
        return response()->json(['nrm' => $nrm], 201);
    }
    public function delete(Request $request, $id)
{
    $nrm = Nrm::find($id);
    if ($nrm) {
        $nrm->delete();
        return response()->json(['success' => true, 'message' => 'NRM Section deleted successfully']);
    } else {
        return response()->json(['success' => false, 'message' => 'NRM Section not found'], 404);
    }
}
public function update(Request $request, $id)
{
    $nrm = Nrm::find($id);
    if ($nrm) {
        $nrm->number = $request->nrmNumber;
        $nrm->save();
        return response()->json(['success' => true, 'message' => 'NRM Section updated successfully']);
    } else {
        return response()->json(['success' => false, 'message' => 'NRM Section not found'], 404);
    }
}

}
