<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Part;
use App\Models\Sub;
use App\Models\Project;

class PartController extends Controller
{
    public function index($id)
    {
        $parts = Part::where('projects_id', $id)->with('subs')->get();
    
        $response = [];
    
        foreach ($parts as $part) {
            $subs = Sub::where('parts_id',$part->id)->get();
            $response = array_merge($response, $subs->toArray());
        }
        
        return response()->json(['parts'=> $parts,'subs' => $response]);
    }

    public function indexname(Request $request)
    {
        $name = $request->input('projectId');
        $project = Project::where('ProjectName', $name)->first();

        if (!$project) {
            return response()->json(['error' => 'Project not found',$name], 404);
        }
    
        $parts = Part::where('projects_id', $project->id)->with('subs')->get();
    
        $response = [];
    
        foreach ($parts as $part) {
            $subs = Sub::where('parts_id', $part->id)->get();
            $response = array_merge($response, $subs->toArray());
        }
    
        return response()->json(['project' => $name, 'parts' => $parts, 'subs' => $response]);
    }
    
    

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'PartName' => 'required',
            'projects_id' => 'required|exists:projects,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $part = Part::create($request->all());

        return response()->json(['part' => $part, 'message' => 'Part created successfully'], 201);
    }

    public function delete(Request $request)
{
    $partId = $request->input('selectedParts');
    $part = Part::find($partId);

    if ($part) {
        $part->delete();
        return response()->json(['message' => 'Part deleted successfully'], 200);
    }

    return response()->json(['message' => 'Part not found'], 404);
}

public function deletesubs(Request $request){
    $ids = $request->input('ids', []);
    Sub::whereIn('id', $ids)->delete();
    return response()->json(['message' => 'Tasks deleted successfully']);
}
}
