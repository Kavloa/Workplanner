<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:teams,name',
        ]);

        $team = new Team();
        $team->name = $request->name;
        $team->save();

        return response()->json(['success' => true, 'team' => $team]);
    }

    // Update an existing team
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|unique:teams,name,'.$id,
        ]);

        $team = Team::find($id);

        if (!$team) {
            return response()->json(['success' => false, 'message' => 'Team not found.'], 404);
        }

        $team->name = $request->name;
        $team->save();

        return response()->json(['success' => true, 'team' => $team]);
    }

    // Delete a team
    public function delete(Team $team)
    {
        $team->delete();
        return response()->json(['success' => true, 'message' => 'Team deleted successfully.']);
    }

    // Get all teams
    public function getall()
    {
        $teams = Team::all();
        return response()->json(['teams' => $teams]);
    }


}
