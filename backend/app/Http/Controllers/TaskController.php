<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\Models\Gantt;

class TaskController extends Controller
{
    public function getTasks()
    {
        $tasks = Gantt::all(); // Assuming 'Task' is your model and it has a relationship with 'usedDates'
        return response()->json($tasks);
    }
}