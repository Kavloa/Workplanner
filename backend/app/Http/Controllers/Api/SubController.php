<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\Employee;
use App\Models\Gantt;
use App\Models\Part;
use App\Models\Project;
use App\Models\TaskAssignment;
use App\Models\Sub;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SubController extends Controller
{
    public function index($id)
    {

        $subs = Sub::where('parts_id', $id)->get();
        return response()->json(['subs' => $subs]);
    }
    public function store(Request $request)
    {
        $nameProject = $request->input('nameProject');
        $color = $request->input('color');
        $TS = [];
        $part = $request->input('part');
        $project = Project::where('ProjectName', $nameProject)->first();
        if (!$project) {
            $project = Project::create([
                'ProjectName' => $nameProject,
                'Color' => $color,
            ]);
        }

        // Check if the part exists in the project
        $partInProject = $project->parts()->where('PartName', $part)->first();

        // If the part doesn't exist, create it
        if (!$partInProject) {
            $partInProject = Part::create(['PartName' => $part, 'projects_id' => $project->id]);
        }

        // Create the Sub
        $subs = $request->input('subsList');

        $duplicateTaskNames = []; // Array to store duplicate task names

        foreach ($subs as $subData) {
            // Check if TaskName already exists for the same part
            $existingSub = Sub::where('parts_id', $partInProject->id)
                ->where('TaskName', $subData['TaskName'])
                ->first();

            if ($existingSub) {
                $duplicateTaskNames[] = $subData['TaskName'];
            }
        }

        if (!empty($duplicateTaskNames)) {
            return response()->json(['message1' => 'Tasks with the following names already exist: ' . implode(', ', $duplicateTaskNames)], 201);
        } else {
            foreach ($subs as $subData) {
                $subData['parts_id'] = $partInProject->id;
                $subData['TS'] = 1;
                $sub = Sub::create($subData);
            }
            return response()->json(['message' => 'Subs created successfully'], 201);
        }
    }

    public function saved(Request $request)
    {
        $data = $request->all();
        $cachedTasks = Cache::get('cachedData');
        $allDetails = []; // Initialize an array to store all details

        if (!empty($data["color"]) && !empty($data['selectedProject'])) {
            $colorExists = Project::where('id', '!=', $data['selectedProject'])
                ->where('color', $data["color"])
                ->exists();
            if (!$colorExists) {
                $project = Project::where('id', $data['selectedProject'])->first();
                if ($project) {
                    $project->update(['Color' => $data["color"]]);
                } else {
                    return response()->json(['message' => 'Selected project not found'], 404);
                }
            }
        }
        // Function to process availability data
        function processAvailability($item, $employeeName, $planHours, $docSupply, $completion, $projectId, $part)
        {
            // Fetch employee details
            $emp = Employee::where('first_name', $employeeName)
                ->with('availabilities')
                ->first();
            if (!$emp) {
                // Handle employee not found
                return null;
            }
            // Retrieve availability data for the employee within the date range
            $ava = $emp->availabilities()
                ->whereBetween('date', [$docSupply, $completion])
                ->orderBy('date', 'asc')
                ->get();

            $inputPlanHours = intval(substr($planHours, 0, 3));
            $date = null;
            $usedDates = [];

            // Process each availability record
            foreach ($ava as $av) {
                list($hours, $minutes) = explode(':', $av->Total);
                $totalHours = $hours + ($minutes / 60);
                $remainingHours = $totalHours - $inputPlanHours;

                if ($remainingHours > 0) {
                    $remainingHours = floor($remainingHours);
                    $remainingMinutes = ($totalHours - $remainingHours) * 60;

                    // Format the remaining time
                    $remainingHours %= 24;
                    $remainingMinutes %= 60;
                    $formattedRemainingTime = sprintf('%02d:%02d', $remainingHours, $remainingMinutes);

                    $date = $av->date;
                    $inputPlanHours = 0;
                    $usedDates[] = ['date' => $av->date, 'subtractedHours' => min($inputPlanHours, $totalHours)];
                } else {
                    $inputPlanHours = (-1) * $remainingHours;
                    $usedDates[] = ['date' => $av->date, 'planhrs' => $inputPlanHours, 'subtractedHours' => $totalHours];
                }
            }

            // Update due date if date is set
            if ($date !== null) {
                $endTaskDate = date_create($date);
                $formattedDate = $endTaskDate->format('Y-m-d');
                $item['due_date'] = $formattedDate;
            }

            // Add project details to the item
            $project = Project::find($projectId);
            $allDetails[] = [
                'employeeName' => $employeeName,
                'task_id' => $item['id'],
                'taskName' => $item['TaskName'],
                'usedDates' => $usedDates,
                'project_id' => $projectId,
                'project_Name' => $project->ProjectName,
                'part_name' => $part->PartName,
            ];

            // Return updated $item
            return $item;
        }

        // Main loop
        foreach ($data as $item) {
            if (isset($item['id'])) {
                $taskId = $item['id'];
                $sub = Sub::find($taskId);
                if ($sub) {
                    $part = Part::find($sub->parts_id); // Retrieve the part associated with the sub task

                    // Update the sub task if it matches
                    if ($sub === $item) {
                        $sub->update($item);
                    } else {
                        // Handle Algorithm_1 and Override_1
                        if (empty($sub->Algorithm_1)) {
                            $itemKey = empty($item['Override_1']) ? 'Algorithm_1' : 'Override_1';
                            $employeeName = $item[$itemKey];

                            $updatedItem = processAvailability($item, $employeeName, $item['Plan'], $item["Doc_Supply"], $item["Completion"], $data['selectedProject'], $part);
                            if ($updatedItem) {
                                $sub->update($updatedItem);
                            }
                        }

                        // Handle Algorithm_2 and Override_2
                        if (empty($sub->Algorithm_2)) {
                            $itemKey = empty($item['Override_2']) ? 'Algorithm_2' : 'Override_2';
                            $employeeName = $item[$itemKey];

                            $updatedItem = processAvailability($item, $employeeName, $item['Plan'], $item["Doc_Supply"], $item["Completion"], $data['selectedProject'], $part);
                            if ($updatedItem) {
                                $sub->update($updatedItem);
                            }
                        }

                        // if (empty($sub->Algorithm_3)) {
                        //     $itemKey = empty($item['Override_3']) ? 'Algorithm_3' : 'Override_3';
                        //     $employeeName = $item[$itemKey];

                        //     $updatedItem = processAvailability($item, $employeeName, $item['Plan'], $item["Doc_Supply"], $item["Completion"], $data['selectedProject'], $part);
                        //     if ($updatedItem) {
                        //         $sub->update($updatedItem);
                        //     }
                        // }

                        // Update $sub if no algorithm value changes
                        if (
                            (empty($item["Algorithm_1"]) || $item["Algorithm_1"] === $sub["Algorithm_1"]) &&
                            (empty($item["Algorithm_2"]) || $item["Algorithm_2"] === $sub["Algorithm_2"])
                            // &&
                            // (empty($item["Algorithm_3"]) || $item["Algorithm_3"] === $sub["Algorithm_3"])
                        ) {
                            $sub->update($item);
                        }
                    }
                }
            }
        }
        // Find the first and last date from usedDates
        foreach ($cachedTasks as $taskD) {
            foreach ($taskD as $task) {
                if (!empty($task['assignments']) && is_array($task['assignments'])) {
                    $employeesData = []; // Array to hold all employee data for the current task
                    $employeeStartEndDates = []; // Track first and last assignment dates for each employee

                    foreach ($task['assignments'] as $assignment) {
                        $employeeName = $assignment['employee'] ?? 'Unknown';
                        $assignmentDate = $assignment['date'] ?? Carbon::now()->format('Y-m-d');

                        // Use firstOrCreate to handle duplicate TaskAssignment records
                        TaskAssignment::firstOrCreate([
                            'task_id' => $task['task_id'],
                            'parts_id' => $task['part_id'],
                            'employee' => $employeeName,
                            'date' => $assignmentDate,
                        ], [
                            'Hrs' => $assignment['hours_assigned'] ?? 0,
                            'task_name' => $task['task_name'] ?? 'Unnamed Task',
                        ]);

                        // Track the first and last occurrence of assignment dates for each employee
                        if (!isset($employeeStartEndDates[$employeeName])) {
                            $employeeStartEndDates[$employeeName] = [
                                'start_date' => $assignmentDate,
                                'end_date' => $assignmentDate,
                            ];
                        } else {
                            $employeeStartEndDates[$employeeName]['start_date'] = min($employeeStartEndDates[$employeeName]['start_date'], $assignmentDate);
                            $employeeStartEndDates[$employeeName]['end_date'] = max($employeeStartEndDates[$employeeName]['end_date'], $assignmentDate);
                        }
                    }
                    // Loop through each employee and update or create Gantt entries
                    foreach ($employeeStartEndDates as $employeeName => $dates) {
                        // Fetch the part and its associated project
                        $part = Part::with('project')->find($task['part_id']);

                        // Determine the project details dynamically
                        $projectName = $part && $part->project ? $part->project->ProjectName : 'Unnamed Project';
                        $projectId = $part && $part->project ? $part->project->id : null;
                        $partName = $part ? $part->PartName : 'Unnamed Part';

                        // Use firstOrCreate to handle duplicate Gantt entries
                        Gantt::firstOrCreate([
                            'task_id' => $task['task_id'],
                            'employee_name' => $employeeName,
                            'Start_date' => $dates['start_date'],
                            'End_date' => $dates['end_date'],
                        ], [
                            'Task_name' => $task['task_name'] ?? 'Unnamed Task',
                            'project_Name' => $projectName,
                            'project_id' => $projectId,
                            'part_Name' => $partName,
                            'part_id' => $task['part_id'],
                        ]);
                    }
                }
            }
        }
        $sortedProjects = Project::with([
            'parts.subs' => function ($query) {
                // No need to order by 'Pri' in SQL since we are sorting in PHP.
            }
        ])->get();
        $TS = [];
        foreach ($sortedProjects as $project) {
            foreach ($project->parts as $part) {
                foreach ($part->subs as $sub) {
                    $override1 = $sub->override_1 ?? null;
                    $override2 = $sub->override_2 ?? null;
                    $algorithm1 = $sub->Algorithm_1;
                    $algorithm2 = $sub->Algorithm_2;
                    // Use overrides if they exist
                    $finalEmployee = $override1 ?: ($override2 ?: $algorithm1);

                    // Add to the $TS array
                    $TS[] = [
                        'TaskName' => $sub->TaskName,
                        'employee_name' => $finalEmployee,
                        'RAP' => $sub->RAP,
                        'Pri' => $sub->Pri,
                    ];

                    // Determine which value to use for the condition
                    $searchEmployee = $override1 ?: $algorithm1; // Use override1 if it has a value, otherwise use algorithm1

                    // Update TaskAssignment
                    TaskAssignment::where('task_id', $sub->task_id)
                        ->where('employee', $searchEmployee) // Match based on override1 or algorithm1
                        ->update(['employee' => $finalEmployee]);

                    // Update Gantt
                    Gantt::where('task_id', $sub->task_id)
                        ->where('employee_name', $searchEmployee) // Match based on override1 or algorithm1
                        ->update(['employee_name' => $finalEmployee]);
                }
            }
        }
        // Sort the $TS array by 'Pri' in ascending order
        usort($TS, function ($a, $b) {
            return $a['Pri'] <=> $b['Pri'];
        });
        // Now, $TS is sorted by 'Pri' in ascending order
        return response()->json(['message' => 'Data updated successfully', 'sortedSubs' => $TS], 200);
    }



    //algorithem
    public function runalgori(Request $request)
    {
        try {
            $dateFormat = 'Y-m-d';
            $allEmployees = Employee::with([
                'availabilities' => function ($query) use ($dateFormat) {
                    $query->orderBy('date', 'asc')->get()->transform(function ($availability) use ($dateFormat) {
                        $availability->date = \Carbon\Carbon::parse($availability->date)->format($dateFormat);
                        return $availability;
                    });
                },
                'tt_hrs',
                'nrms' => function ($query) {
                    $query->whereRaw('CAST(OAP AS CHAR) REGEXP "^[0-9]+(\\.[0-9]+)?$"')
                        ->orderBy('OAP', 'asc');
                }
            ])->get();
            
            $tasks = Project::with([
                'parts.subs' => function ($query) {
                    $query->select(
                        'id',
                        'TaskName',
                        'PP',
                        'RAP',
                        'Pri',
                        'Doc_Supply',
                        'Completion',
                        'TS',
                        'Plan',
                        'Algorithm_1',
                        'Algorithm_2',
                        'Algorithm_3',
                        'DD',
                        'parts_id'
                    )->orderBy('Pri', 'asc');
                }
            ])->get()->flatMap(function ($project) use ($dateFormat) {
                return $project->parts->flatMap(function ($part) use ($dateFormat) {
                    return $part->subs->map(function ($sub) use ($dateFormat) {
                        $sub->Doc_Supply = \Carbon\Carbon::parse($sub->Doc_Supply)->format($dateFormat);
                        $sub->Completion = \Carbon\Carbon::parse($sub->Completion)->format($dateFormat);
                        return $sub->toArray();
                    });
                });
            })->sortBy('Pri')->values();
            $filteredTasks = [];
            $spentHrs = [];
            $assignmentDetails = [];
            $assignedHoursTracker = [];
            foreach ($tasks as &$task) {
                $task['Plan'] = is_numeric($task['Plan']) ? (float) $task['Plan'] : 0;
                $number = $this->extractNumberFromTaskName($task['TaskName']);
                $candidates = collect();
                $employeeEndDates = [];
                foreach ($allEmployees as $employee) {
                    $filteredNrms = $employee->nrms->filter(fn($nrm) => $nrm->number == $number);
                    if ($filteredNrms->isNotEmpty()) {
                        $filteredAvailabilities = $employee->availabilities->filter(function ($availability) use ($task) {
                            return $availability->date >= $task['Doc_Supply'] && $availability->date <= $task['Completion'];
                        });
                        if ($filteredAvailabilities->isEmpty()) {
                            $filteredAvailabilities = $employee->availabilities->sortBy(function ($availability) use ($task) {
                                return abs(strtotime($availability->date) - strtotime($task['Doc_Supply']));
                            })->take(1);
                        }
                        if ($filteredAvailabilities->isEmpty()) {
                            $filteredAvailabilities = $employee->availabilities->filter(function ($availability) use ($task) {
                                return $availability->date > $task['Completion'];
                            })->sortBy('date')->take(1);
                        }
                        if ($filteredAvailabilities->isNotEmpty()) {
                            $candidates->push([
                                'employee' => $employee,
                                'availabilities' => $filteredAvailabilities,
                                'OAP' => $filteredNrms->first()->pivot->OAP
                            ]);
                        }
                    }
                }

                if ($candidates->isNotEmpty()) {
                    $candidates = $candidates->sortBy('OAP')->values();

                    $totalAssignedHours = 0;

                    $start_date_set = false;

                    $taskAssignmentDetails = [
                        'task_id' => $task['id'],
                        'part_id' => $task['parts_id'],
                        'task_name' => $task['TaskName'],
                        'assignments' => [],
                        'primary_employee' => null,
                        'secondary_employee' => null,
                        'tertiary_employee' => null,
                        'end_dates' => []
                    ];

                    $assignedEmployees = [];

                    $start_date = $task['Doc_Supply'];

                    $closestCandidate = null;

                    $closestAvailableDate = null;

                    $closestAvailableHours = 0;

                    foreach ($candidates as $candidate) {

                        $isAlreadyAssigned = false;

                        foreach ($assignedHoursTracker[$candidate['employee']->id] ?? [] as $assignedDate => $hours) {
                            if ($assignedDate == $task['Doc_Supply']) {
                                $isAlreadyAssigned = true;
                                break;
                            }
                        }
                        if (!$isAlreadyAssigned) {
                            foreach ($candidate['availabilities'] as $availability) {
                                $date = $availability->date;
                                $previouslyAssignedHours = $assignedHoursTracker[$candidate['employee']->id][$date] ?? 0;
                                $availableHours = max(0, $this->convertToHours($availability['Total']) - $previouslyAssignedHours);

                                if ($availableHours > 0) {
                                    if (!$start_date_set && $date >= $task['Doc_Supply'] && $date <= $task['Completion']) {
                                        $task['start_date'] = $date;
                                        $start_date_set = true;
                                    }

                                    // Track assigned days
                                    $employeeDayTracker[$candidate['employee']->id] = ($employeeDayTracker[$candidate['employee']->id] ?? 0) + 1;

                                    // If employee exceeds 4 days, switch to the next employee
                                    if ($employeeDayTracker[$candidate['employee']->id] == 4) {
                                        $task['Status'] = "To Be Split";
                                    }

                                    $hoursToAssign = min($task['Plan'] - $totalAssignedHours, $availableHours);
                                    $totalAssignedHours += $hoursToAssign;
                                    $assignedHoursTracker[$candidate['employee']->id][$date] = $previouslyAssignedHours + $hoursToAssign;

                                    $taskAssignmentDetails['assignments'][] = [
                                        'employee' => $candidate['employee']->first_name,
                                        'date' => $date,
                                        'hours_assigned' => $hoursToAssign,
                                        'remaining_hours' => $availableHours - $hoursToAssign
                                    ];

                                    $this->updateSpentHrs($spentHrs, $candidate['employee']->id, $task['id'], $task['TaskName'], $hoursToAssign, $date);
                                    $employeeEndDates[$candidate['employee']->first_name] = $date;



                                    if (!in_array($candidate['employee']->first_name, $assignedEmployees)) {
                                        $assignedEmployees[] = $candidate['employee']->first_name;
                                        if (count($assignedEmployees) == 1) {
                                            $taskAssignmentDetails['primary_employee'] = $candidate['employee']->first_name;
                                        } elseif (count($assignedEmployees) == 2) {
                                            $taskAssignmentDetails['secondary_employee'] = $candidate['employee']->first_name;
                                        } elseif (count($assignedEmployees) == 3) {
                                            $taskAssignmentDetails['tertiary_employee'] = $candidate['employee']->first_name;
                                        }
                                    }

                                    if ($totalAssignedHours >= $task['Plan']) {
                                        break 2;
                                    }
                                }
                            }
                        } else {
                            foreach ($candidate['availabilities'] as $availability) {
                                $date = $availability->date;
                                if ($date > $task['Doc_Supply']) {
                                    $previouslyAssignedHours = $assignedHoursTracker[$candidate['employee']->id][$date] ?? 0;
                                    $availableHours = max(0, $this->convertToHours($availability['Total']) - $previouslyAssignedHours);

                                    if ($availableHours > 0 && ($closestAvailableDate === null || $date < $closestAvailableDate)) {
                                        $closestCandidate = $candidate;
                                        $closestAvailableDate = $date;
                                        $closestAvailableHours = $availableHours;
                                    }
                                }
                            }
                        }
                    }

                    if ($totalAssignedHours < $task['Plan'] && $closestCandidate !== null) {
                        $hoursToAssign = min($task['Plan'] - $totalAssignedHours, $closestAvailableHours);
                        $totalAssignedHours += $hoursToAssign;
                        $assignedHoursTracker[$closestCandidate['employee']->id][$closestAvailableDate] =
                            ($assignedHoursTracker[$closestCandidate['employee']->id][$closestAvailableDate] ?? 0) + $hoursToAssign;

                        $taskAssignmentDetails['assignments'][] = [
                            'employee' => $closestCandidate['employee']->first_name,
                            'date' => $closestAvailableDate,
                            'hours_assigned' => $hoursToAssign,
                            'remaining_hours' => $closestAvailableHours - $hoursToAssign
                        ];

                        $task['start_date'] = $task['start_date'] ?? $closestAvailableDate;

                        $this->updateSpentHrs(

                            $spentHrs,

                            $closestCandidate['employee']->id,

                            $task['id'],

                            $task['TaskName'],

                            $hoursToAssign,

                            $closestAvailableDate

                        );

                        $employeeEndDates[$closestCandidate['employee']->first_name] = $closestAvailableDate;

                        if (!in_array($closestCandidate['employee']->first_name, $assignedEmployees)) {

                            $assignedEmployees[] = $closestCandidate['employee']->first_name;

                            if (count($assignedEmployees) == 1) {

                                $taskAssignmentDetails['primary_employee'] = $closestCandidate['employee']->first_name;
                            } elseif (count($assignedEmployees) == 2) {

                                $taskAssignmentDetails['secondary_employee'] = $closestCandidate['employee']->first_name;
                            } elseif (count($assignedEmployees) == 3) {

                                $taskAssignmentDetails['tertiary_employee'] = $closestCandidate['employee']->first_name;
                            }
                        }
                    }


                    $taskAssignmentDetails['end_dates'] = $employeeEndDates;

                    $task['Algorithm_1'] = $taskAssignmentDetails['primary_employee'];

                    $task['Algorithm_2'] = $taskAssignmentDetails['secondary_employee'];
                    $task['Algorithm_3'] = $taskAssignmentDetails['tertiary_employee'];

                    $task['end_dates'] = $employeeEndDates;

                    if ($task['Algorithm_1'] && $task['Algorithm_2'] && $task['Algorithm_3']) {
                        $task['TS'] = "3";
                    } elseif ($task['Algorithm_1'] && $task['Algorithm_2']) {
                        $task['TS'] = "2";
                    } elseif ($task['Algorithm_1']) {
                        $task['TS'] = "1";
                    } else {
                        $task['TS'] = "0";
                    }
                    $filteredTasks[] = $task;

                    $assignmentDetails[] = $taskAssignmentDetails;
                }
            }
            foreach ($tasks as &$task) {

                if ($task['Plan'] > 0 && !isset($task['Algorithm_1'])) {

                    $totalAssignedHours = 0;

                    $taskAssignmentDetails = [

                        'task_id' => $task['id'],

                        'part_id' => $task['parts_id'],

                        'task_name' => $task['TaskName'],

                        'assignments' => [],

                        'primary_employee' => null,

                        'secondary_employee' => null,
                        'tertiary_employee' => null,

                        'end_dates' => []

                    ];

                    $candidates = collect();

                    foreach ($allEmployees as $employee) {

                        $filteredNrms = $employee->nrms->filter(fn($nrm) => $nrm->number == $this->extractNumberFromTaskName($task['TaskName']));

                        if ($filteredNrms->isNotEmpty()) {

                            $filteredAvailabilities = $employee->availabilities->filter(function ($availability) use ($task) {

                                return $availability->date >= $task['Doc_Supply'];
                            })->sortBy('date');


                            if ($filteredAvailabilities->isNotEmpty()) {

                                $candidates->push([

                                    'employee' => $employee,

                                    'availabilities' => $filteredAvailabilities,

                                    'OAP' => $filteredNrms->first()->pivot->OAP

                                ]);
                            }
                        }
                    }
                    // Check if there are available candidates
                    if ($candidates->isNotEmpty()) {

                        // Sort candidates by 'OAP' field and reset array keys
                        $candidates = $candidates->sortBy('OAP')->values();

                        // Initialize a set to track unique assignment dates
                        $assignedDates = [];

                        // Iterate through each candidate
                        foreach ($candidates as $candidate) {

                            // Iterate through each availability of the current candidate
                            foreach ($candidate['availabilities'] as $availability) {

                                // Extract the availability date
                                $date = $availability->date;

                                // Get the previously assigned hours for the candidate on this date
                                $previouslyAssignedHours = $assignedHoursTracker[$candidate['employee']->id][$date] ?? 0;

                                // Calculate the available hours by subtracting previously assigned hours
                                $availableHours = max(0, $this->convertToHours($availability['Total']) - $previouslyAssignedHours);

                                // Check if the candidate still has available hours
                                if ($availableHours > 0) {

                                    // Determine how many hours to assign (remaining task hours vs available hours)
                                    $hoursToAssign = min($task['Plan'] - $totalAssignedHours, $availableHours);

                                    // Update total assigned hours for the task
                                    $totalAssignedHours += $hoursToAssign;

                                    // Update the assigned hours tracker for this candidate and date
                                    $assignedHoursTracker[$candidate['employee']->id][$date] = $previouslyAssignedHours + $hoursToAssign;

                                    // Store assignment details
                                    $taskAssignmentDetails['assignments'][] = [
                                        'employee' => $candidate['employee']->first_name,
                                        'date' => $date,
                                        'hours_assigned' => $hoursToAssign,
                                        'remaining_hours' => $availableHours - $hoursToAssign
                                    ];

                                    // Track the unique assigned dates
                                    $assignedDates[$date] = true;

                                    // Update spent hours tracking for reporting purposes
                                    $this->updateSpentHrs($spentHrs, $candidate['employee']->id, $task['id'], $task['TaskName'], $hoursToAssign, $date);

                                    // Track the last assigned date for each employee
                                    $taskAssignmentDetails['end_dates'][$candidate['employee']->first_name] = $date;

                                    // Check if the required hours for the task have been fully assigned
                                    if ($totalAssignedHours >= $task['Plan']) {

                                        // Count the unique days the task was assigned


                                        // Assign the first candidate to 'Algorithm_1'
                                        $task['Algorithm_1'] = $taskAssignmentDetails['assignments'][0]['employee'];

                                        // If a second candidate exists, assign them to 'Algorithm_2'
                                        $task['Algorithm_2'] = $taskAssignmentDetails['assignments'][1]['employee'] ?? null;
                                        $task['Algorithm_3'] = $taskAssignmentDetails['assignments'][2]['employee'] ?? null;

                                        // Store the final assigned end dates
                                        $task['end_dates'] = $taskAssignmentDetails['end_dates'];

                                        // Determine the assignment type based on the number of employees assigned
                                        if ($task['Algorithm_1'] && $task['Algorithm_2'] && $task['Algorithm_3']) {
                                            $task['TS'] = "3";
                                        } elseif ($task['Algorithm_1'] && $task['Algorithm_2']) {
                                            $task['TS'] = "2";
                                        } elseif ($task['Algorithm_1']) {
                                            $task['TS'] = "1";
                                        } else {
                                            $task['TS'] = "0";
                                        }

                                        // Add the task to the filtered list
                                        $filteredTasks[] = $task;

                                        // Store task assignment details
                                        $assignmentDetails[] = $taskAssignmentDetails;

                                        // Break out of both loops since the task has been fully assigned
                                        break 2;
                                    }
                                }
                            }
                        }
                    }
                }
            }


            Cache::forever('cachedData', [

                'assignmentDetails' => $assignmentDetails,

                'filteredTasks' => $filteredTasks

            ]);

            return response()->json([

                'message' => 'Algorithm executed successfully',

                'filteredTasks' => $filteredTasks,

                'assignmentDetails' => $assignmentDetails

            ]);
        } catch (\Exception $e) {
            return response()->json([

                'message' => 'Error executing algorithm',

                'error' => $e->getMessage(),

            ], 500);
        }
    }





    // Helper function to convert HH:MM time format to hours in decimal
    private function convertToHours($time)
    {
        if (strpos($time, ':') !== false) {
            list($hours, $minutes) = explode(':', $time);
            return $hours + ($minutes / 60);
        }
        return is_numeric($time) ? (float) $time : 0;
    }




    // Helper function to check if the employee has overlapping tasks within the date range
    protected function hasOverlappingTasks($employee, $taskStartDate, $taskEndDate)
    {
        if (!$employee->tasks) {
            return false;
        }

        foreach ($employee->tasks as $assignedTask) {
            if (
                ($taskStartDate >= $assignedTask->start_date && $taskStartDate <= $assignedTask->end_date) ||
                ($taskEndDate >= $assignedTask->start_date && $taskEndDate <= $assignedTask->end_date)
            ) {
                return true;
            }
        }
        return false;
    }


    private function extractNumberFromTaskName($taskName)
    {
        preg_match('/^\d+\.\d+/', $taskName, $matches);
        return $matches[0] ?? null;
    }

    private function allocateHours($totalHours, $type)
    {
        // Example split: lower OAP takes 60%, higher OAP takes 40%
        $hours = intval(substr($totalHours, 0, 2)); // Extract the numeric part from Plan
        $split = $type === 'lower' ? 0.6 : 0.4; // 60% for lower, 40% for higher
        return sprintf('%02d:00', floor($hours * $split)); // Return the allocated hours in HH:MM format
    }

    private function updateSpentHrs(&$spentHrs, $employeeId, $taskId, $taskName, $hoursSpent, $startDate)
    {
        $existingEntry = collect($spentHrs)->firstWhere('employee_id', $employeeId);

        if ($existingEntry) {
            // Update the existing entry by appending the task name and updating hours
            $existingEntry['task_name'] .= ', ' . $taskName;
            $existingEntry['hours_spent'] .= ', ' . $hoursSpent;
            $existingEntry['start_date'] .= ', ' . $startDate;
        } else {
            // Create a new entry for the employee
            $spentHrs[] = [
                'employee_id' => $employeeId,
                'task_id' => $taskId,
                'task_name' => $taskName,
                'hours_spent' => $hoursSpent,
                'start_date' => $startDate,
                'date' => now()->toDateString(),
            ];
        }
    }
}
