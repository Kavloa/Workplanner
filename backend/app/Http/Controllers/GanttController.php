<?php

namespace App\Http\Controllers;

use App\Models\Gantt;
use App\Models\TaskAssignment;
use Illuminate\Http\Request;

class GanttController extends Controller
{
    /**
     * Retrieve all task assignments and Gantt entries, and return them as JSON.
     */
    public function index()
    {
        // Retrieve all Gantt entries
        $ganttEntries = Gantt::all();

        // Retrieve all Task assignments
        $taskAssignments = TaskAssignment::all();

        // Return the combined data as JSON
        return response()->json([
            'ganttEntries' => $ganttEntries,
            'taskAssignments' => $taskAssignments,
        ]);
    }

    /**
     * Retrieve TaskAssignments and Gantt entries filtered by a specific task ID.
     */
    public function getByTaskId($taskId)
    {
        // Retrieve Gantt entries by task ID
        $ganttEntries = Gantt::where('task_id', $taskId)->get();

        // Retrieve TaskAssignments by task ID
        $taskAssignments = TaskAssignment::where('task_id', $taskId)->get();

        // Return the combined data as JSON
        return response()->json([
            'ganttEntries' => $ganttEntries,
            'taskAssignments' => $taskAssignments,
        ]);
    }

    /**
     * Retrieve TaskAssignments and Gantt entries filtered by a specific employee name.
     */
    public function getByEmployee($employee)
    {
        // Retrieve Gantt entries by employee name
        $ganttEntries = Gantt::where('employee_name', $employee)->get();

        // Retrieve TaskAssignments by employee name
        $taskAssignments = TaskAssignment::where('employee', $employee)->get();

        // Return the combined data as JSON
        return response()->json([
            'ganttEntries' => $ganttEntries,
            'taskAssignments' => $taskAssignments,
        ]);
    }

    /**
     * Retrieve Gantt entries and TaskAssignments within a specific date range.
     */
    public function getByDateRange(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        // Retrieve Gantt entries within the date range
        $ganttEntries = Gantt::whereBetween('Start_date', [$startDate, $endDate])->get();

        // Retrieve TaskAssignments within the date range
        $taskAssignments = TaskAssignment::whereBetween('date', [$startDate, $endDate])->get();

        // Return the combined data as JSON
        return response()->json([
            'ganttEntries' => $ganttEntries,
            'taskAssignments' => $taskAssignments,
        ]);
    }
}
