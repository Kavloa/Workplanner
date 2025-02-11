<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AvailabilityImport;
use App\Models\Employee;
use App\Models\Nrm;
use App\Models\Part;
use App\Models\Project;
use App\Models\Sub;
use App\Models\Gantt;
use App\Models\Team;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = Employee::with(['availabilities' => function ($query) {
            $query->whereNotNull('date')->orderBy('date', 'asc');
        }])
            ->get();

        return response()->json(['employees' => $employees]);
    }
    public function store(Request $request)
    {
        // chamge 8/2
        // Validate the request data
        $validatedData = $request->validate([
            'date' => 'date',
            'strt1' => 'date_format:H:i|nullable',
            'end1' => 'date_format:H:i|nullable',
            'strt2' => 'date_format:H:i|nullable',
            'end2' => 'date_format:H:i|nullable',
            'strt3' => 'date_format:H:i|nullable',
            'end3' => 'date_format:H:i|nullable',
            'strt4' => 'date_format:H:i|nullable',
            'end4' => 'date_format:H:i|nullable',
            "Total" => "date_format:H:i|nullable",
            "total_ava" => "date_format:H:i|nullable",
            'employee_id' => 'numeric',
        ]);

        $validatedData['total_ava'] = $validatedData['Total'];

        // Calculate the time differences
        $availability = new AvailabilityImport($validatedData);
        $employee = Employee::find($request->employee_id);
        $availability->save();
        return response()->json(['message' => 'Availability saved successfully']);
    }

    /**
     * Calculate the time difference in hours between two time strings.
     *
     * @param string $startTime
     * @param string $endTime
     * @return float
     */
    private function calculateTimeDifference($startTime, $endTime)
    {
        $start = \Carbon\Carbon::parse($startTime);
        $end = \Carbon\Carbon::parse($endTime);

        // Calculate the difference in hours
        $difference = $end->diffInHours($start);

        return $difference;
    }

    public function destroy($id)
    {
        try {
            $availability = AvailabilityImport::findOrFail($id);
            $availability->delete();
            return response()->json(['message' => 'Availability deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete availability', 'message' => $e->getMessage()], 500);
        }
    }
    public function update(Request $request, $id)
    {
        // Validate the request data
        $validatedData2 = $request->validate([
            'date' => 'required|date',
            'strt1' => 'date_format:H:i',
            'end1' => 'date_format:H:i',
            'strt2' => 'date_format:H:i',
            'end2' => 'date_format:H:i',
            'strt3' => 'date_format:H:i',
            'end3' => 'date_format:H:i',
            'strt4' => 'date_format:H:i',
            'end4' => 'date_format:H:i',
            'Total' => 'date_format:H:i',
            'total_ava' => 'date_format:H:i', // Corrected validation rule
            'employee_id' => 'numeric',
        ]);

        // Calculate the time differences
        $availability = AvailabilityImport::findOrFail($id);

        // Update the availability fields
        $availability->update($validatedData2);

        // Update the 'total_ava' field separately
        $availability->update(['Total' => $validatedData2['total_ava']]);

        return response()->json(['message' => 'Availability updated successfully']);
    }

    public function duplicate(Request $request, $id)
    {
        $initialWeek = $request->input('initialWeek');
        $employee = Employee::findOrFail($id);
    
        // Calculate the start and end dates of the initial week
        $initialWeekStart = Carbon::parse($initialWeek)->startOfWeek();
        $initialWeekEnd = Carbon::parse($initialWeek)->endOfWeek();
    
        // Fetch availabilities for the initial week
        $availabilities = AvailabilityImport::where('employee_id', $employee->id)
            ->whereBetween('date', [$initialWeekStart, $initialWeekEnd])
            ->get();
    
        $dates = $request->input('dates');
        $updatedAvailabilities = [];
    
        foreach ($dates as $newDate) {
            // Calculate the start and end dates for the new week
            $newWeekStart = Carbon::parse($newDate['datefirst'])->startOfWeek();
            $newWeekEnd = Carbon::parse($newDate['datefirst'])->endOfWeek();
    
            foreach ($availabilities as $availability) {
                $dayOfWeek = Carbon::parse($availability->date)->dayOfWeek;
                $newAvailabilityDate = $newWeekStart->copy()->addDays($dayOfWeek - 1);
    
                // Remove any existing availabilities for the new date and employee ID
                AvailabilityImport::where('employee_id', $employee->id)
                    ->whereDate('date', $newAvailabilityDate)
                    ->delete();
    
                // Create new availability for the new week
                $newAvailability = AvailabilityImport::create([
                    'employee_id' => $employee->id,
                    'date' => $newAvailabilityDate,
                    'strt1' => $availability->strt1,
                    'end1' => $availability->end1,
                    'strt2' => $availability->strt2,
                    'end2' => $availability->end2,
                    'strt3' => $availability->strt3,
                    'end3' => $availability->end3,
                    'strt4' => $availability->strt4,
                    'end4' => $availability->end4,
                    'Total' => $availability->Total,
                    'total_ava' => $availability->total_ava,
                ]);
    
                $updatedAvailabilities[] = $newAvailability;
            }
        }
    
        return response()->json(['message' => 'Data duplicated successfully', 'availabilities' => $updatedAvailabilities]);
    }
    

    public function update2(Request $request)
    {
        $data = $request->all();
        foreach ($data as $item) {
            if (isset($item['id'])) {
                $taskId = $item['id'];
                $sub = AvailabilityImport::find($taskId);
                if ($sub) {
                    $sub->update($item);
                }
            } else {
                $existingEntry = AvailabilityImport::where('employee_id', $item['employee_id'])
                    ->where('date', $item['date'])
                    ->first();

                if ($existingEntry) {
                    // Update existing entry
                    $existingEntry->update($item);
                } else {
                    AvailabilityImport::create($item);
                }
            }
        }
        $existingAvailability = AvailabilityImport::where('employee_id', $data[0]["employee_id"])->get();
        return response()->json(['message' => 'Data updated successfully', 'data' => $existingAvailability], 200);
    }

    public function gethost()
    {
        $employees = Employee::orderBy('first_name', 'asc')->get();

        $result = [];
        // $latesubs = Gantt::where('End_date', '<=', now())
        // // ->where('C_per', '<', 100)
        // ->get();

        $idCounter = 1; // Variable to keep track of the ID incrementation

        foreach ($employees as $employee) {
            $subs = Sub::with("part.project")
                ->where('Algorithm_1', $employee->first_name)
                ->orWhere('Algorithm_2', $employee->first_name)
                ->orWhere('Override_1', $employee->first_name)
                ->orWhere('Override_2', $employee->first_name)
                ->get();
            $encounteredIds = [];
            if ($subs && $subs->isNotEmpty()) {
                foreach ($subs as $sub) {
                    $borderColor = "1px solid #000000"; // Default border color
                    if ($sub->Completion <= now() && $sub->C_per < 100) {
                        $borderColor = "2px solid #ff0000";
                    }

                    // Increment the ID counter by 1 for each task
                    $id = $idCounter++;

                    // Check if the ID has already been encountered
                    if (!in_array($id, $encounteredIds)) {
                        // If not encountered, add it to the result array and mark it as encountered
                        $result[] = [
                            "id" => $id,
                            'project' => $employee->first_name,
                            'text' => $sub->TaskName,
                            'part_id' => $sub -> parts_id,
                            'start_date' => $sub->Doc_Supply,
                            'duration' => $sub->Doc_Supply,
                            'end_date' => $sub->Completion,
                            'color' => $sub->part->project->Color,
                            'Ptask' => $sub->part->project->ProjectName,
                            'Ptaskid' => $sub->part->project->id,
                            'progress' => $sub->C_per,
                            'progressColor' => '#00a002',
                            "progressTextStyle" => "color: black",
                            "border" => "",
                        ];
                        $encounteredIds[] = $id;
                    }

                }
            }
        }

        return response()->json(['employees' => $result]);
    }



    public function gethost2(Request $request)
    {
        $data = $request->input("data");
        $employees = Employee::all();

        $result = [];

        foreach ($employees as $employee) {
            $subs = Sub::with("part.project")
                ->where(function ($query) use ($employee) {
                    $query->where('Algorithm_1', $employee->first_name)
                        ->orWhere('Algorithm_2', $employee->first_name)
                        ->orWhere('Override_1', $employee->first_name)
                        ->orWhere('Override_2', $employee->first_name);
                })
                ->get();

            if ($subs && $subs->isNotEmpty()) {
                foreach ($subs as $sub) {
                    // Add the condition to check if project name is equal to provided data
                    if ($sub->part->project->ProjectName === $data) {
                        $result[] = [
                            "id" => $sub->id,
                            'project' => $employee->first_name,
                            'text' => $sub->TaskName,
                            'start_date' => $sub->Doc_Supply,
                            'duration' => $sub->Doc_Supply,
                            'end_date' => $sub->Completion,
                            'color' => $sub->part->project->Color,
                            'Ptask' => $sub->part->project->ProjectName,
                            'Ptaskid' => $sub->part->project->id,
                            'progress' => 0.75,
                            'progressColor' => '#00a002',
                            "progressTextStyle" => "color: black",
                            "border" => "",
                        ];
                    }
                }
            }
        }

        return response()->json(['employees' => $result]);
    }

    public function getemploye()
    {
        $employees = Employee::with(['team', 'nrms'])->get();
        $teams = Team::all();
        $nrms = Nrm::all(); // Assuming 'number' is the field you want
        return response()->json(['employees' => $employees, 'teams' => $teams, 'nrms' => $nrms]);
    }

    public function saveemploye(Request $request)
    {
        $teamsData = $request->all();

        foreach ($teamsData as $teamData) {
            foreach ($teamData['members'] as $memberData) {
                $teamId = $memberData['team_id'];
                if (!empty($memberData['id']) && Employee::where('id', $memberData['id'])->exists()) {
                    $employee = Employee::find($memberData['id']);
                    $employee->first_name = $memberData['first_name'];
                    $employee->team_id = $teamId;
                    $employee->save();
                } else {

                    $employee = new Employee([
                        'first_name' => $memberData['first_name'],
                        'team_id' => $teamId,
                    ]);
                    $employee->save(); // Saving the new employee
                }

                // Process NRMs for the employee
                $nrmsSyncData = [];
                foreach ($memberData['nrms'] as $nrmData) {
                    $nrm = Nrm::firstOrCreate(
                        ['id' => $nrmData['id']],
                        ['number' => $nrmData['number'] ?? null]
                    );

                    // Only sync if 'OAP' is not null
                    if ($nrmData['pivot']['OAP'] !== null) {
                        $nrmsSyncData[$nrm->id] = ['OAP' => $nrmData['pivot']['OAP']];
                    } else {
                        $employee->nrms()->detach($nrm->id);
                    }
                }

                if (!empty($nrmsSyncData)) {
                    $employee->nrms()->sync($nrmsSyncData);
                }
            }
        }

        return response()->json(['message' => 'Data saved successfully'], 200);
    }

    public function deleteEmployees(Request $request)
    {
        $employeeIds = $request->input('employeeIds', []); // Assuming the IDs are sent as an array

        if (empty($employeeIds)) {
            return response()->json(['message' => 'No employees selected for deletion'], 400);
        }

        try {
            Employee::destroy($employeeIds);
            return response()->json(['message' => 'Employees deleted successfully']);
        } catch (\Exception $e) {
            // Handle the error appropriately
            return response()->json(['message' => 'Error deleting employees', 'error' => $e->getMessage()], 500);
        }
    }

    public function getEmployeeTotalHours(Request $request)
    {
        $startDate = $request->start;
        $endDate = $request->end;

        // Validate dates
        $request->validate([
            'start' => 'required|date',
            'end' => 'required|date|after_or_equal:start',
        ]);

        $employees = Employee::with(['availabilities' => function($query) use ($startDate, $endDate) {
            $query->select('employee_id', DB::raw("SUM(TIME_TO_SEC(Total) / 3600) as total_hours"))
                  ->whereBetween('date', [$startDate, $endDate])
                  ->groupBy('employee_id');
        }])->get(['id', 'first_name']);

        // Format data to include only necessary fields
        $result = $employees->map(function ($employee) {
            $firstAvailability = $employee->availabilities->first();
            $totalHours = $firstAvailability ? round($firstAvailability->total_hours, 2) : 0; // Ensure there's a fallback
            return [
                'name' => $employee->first_name,
                'total_hours' => gmdate('H:i', $totalHours * 3600)  // Format as HH:MM
            ];
        });

        return response()->json($result);
    }



}
