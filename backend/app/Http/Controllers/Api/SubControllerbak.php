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
        foreach ($data as $item) {
            if (isset($item['id'])) {
                $taskId = $item['id'];
                $sub = Sub::find($taskId);
                if ($sub) {
                    $part = Part::find($sub->parts_id); // Retrieve the part associated with the sub task
                    if ($sub === $item) {
                        $sub->update($item);
                    } else {
                        if ($sub->Algorithm_1 === null || $sub->Algorithm_1 === "") {
                            if (empty($item['Override_1']) && $item['Algorithm_1']) {
                                $emp = Employee::where('first_name', $item['Algorithm_1'])
                                    ->leftJoin('availabilities as a', 'a.employee_id', '=', 'employees.id')
                                    ->select('employees.first_name', 'employees.id', DB::raw('COUNT(a.id) as availability_count'), DB::raw('SUM(a.Total) as sotal'))
                                    ->groupBy('employees.id', 'employees.first_name')
                                    ->first();

                                // Retrieve availability for Algorithm_1
                                $ava = Availability::where('employee_id', $emp->id)
                                    ->whereBetween('date', [$item["Doc_Supply"], $item["Completion"]])
                                    ->orderBy('date', 'asc')
                                    ->get();

                                // Process availability data for Algorithm_1
                                $availabilityHours = intval(substr($emp->sotal, 0, 3));
                                $inputPlanHours = intval(substr($item["Plan"], 0, 3));
                                $date = null;
                                $usedDates = [];

                                foreach ($ava as $av) {
                                    list($hours, $minutes) = explode(':', $av->Total);
                                    $totalHours = $hours + ($minutes / 60);
                                    $remainingHours = $totalHours - $inputPlanHours;

                                    if ($remainingHours > 0) {
                                        $remainingHours = floor($remainingHours);
                                        $remainingMinutes = ($totalHours - $remainingHours) * 60;

                                        $remainingHours %= 24;
                                        $remainingMinutes %= 60;
                                        $formattedRemainingTime = sprintf('%02d:%02d', $remainingHours, $remainingMinutes);

                                        // $av->update(['Total' => $formattedRemainingTime]);
                                        $date = $av->date;
                                        $inputPlanHours = 0;
                                        $usedDates[] = ['date' => $av->date, 'subtractedHours' => min($inputPlanHours, $totalHours)];
                                    } else {
                                        // $av->update(['Total' => '00:00']);
                                        $inputPlanHours = (-1) * $remainingHours;
                                        $usedDates[] = ['date' => $av->date, 'planhrs' => $inputPlanHours, 'subtractedHours' => $totalHours];
                                    }
                                }

                                // Update due date for Algorithm_1 if date is set
                                if ($date !== null) {
                                    $endTaskDate = date_create($date);
                                    $formattedDate = $endTaskDate->format('Y-m-d');
                                    $item['due_date'] = $formattedDate;
                                }

                                // Add details for Algorithm_1 to $allDetails array
                                $project = Project::find($data['selectedProject']);
                                $allDetails[] = [
                                    'employeeName' => $item['Algorithm_1'],
                                    'task_id' => $item['id'],
                                    'taskName' => $item['TaskName'],
                                    'usedDates' => $usedDates,
                                    'project_id' => $data['selectedProject'],
                                    'project_Name' => $project->ProjectName,
                                    'part_name' => $part->PartName,
                                ];

                                // Update $sub with $item data
                                $sub->update($item);
                            } elseif ($item['Override_1']) {
                                // Logic for Override_1 (similar to Algorithm_1)
                                // Fetch employee and availability details for Override_1
                                $emp = Employee::where('first_name', $item['Override_1'])
                                    ->leftJoin('availabilities as a', 'a.employee_id', '=', 'employees.id')
                                    ->select('employees.first_name', 'employees.id', DB::raw('COUNT(a.id) as availability_count'), DB::raw('SUM(a.Total) as sotal'))
                                    ->groupBy('employees.id', 'employees.first_name')
                                    ->first();

                                // Retrieve availability for Override_1
                                $ava = Availability::where('employee_id', $emp->id)
                                    ->whereBetween('date', [$item["Doc_Supply"], $item["Completion"]])
                                    ->orderBy('date', 'asc')
                                    ->get();

                                // Process availability data for Override_1
                                $availabilityHours = intval(substr($emp->sotal, 0, 3));
                                $inputPlanHours = intval(substr($item["Plan"], 0, 3));
                                $date = null;
                                $usedDates = [];

                                foreach ($ava as $av) {
                                    list($hours, $minutes) = explode(':', $av->Total);
                                    $totalHours = $hours + ($minutes / 60);
                                    $remainingHours = $totalHours - $inputPlanHours;

                                    if ($remainingHours > 0) {
                                        $remainingHours = floor($remainingHours);
                                        $remainingMinutes = ($totalHours - $remainingHours) * 60;

                                        $remainingHours %= 24;
                                        $remainingMinutes %= 60;
                                        $formattedRemainingTime = sprintf('%02d:%02d', $remainingHours, $remainingMinutes);

                                        // $av->update(['Total' => $formattedRemainingTime]);
                                        $date = $av->date;
                                        $inputPlanHours = 0;
                                        $usedDates[] = ['date' => $av->date, 'subtractedHours' => min($inputPlanHours, $totalHours)];
                                    } else {
                                        // $av->update(['Total' => '00:00']);
                                        $inputPlanHours = (-1) * $remainingHours;
                                        $usedDates[] = ['date' => $av->date, 'planhrs' => $inputPlanHours, 'subtractedHours' => $totalHours];
                                    }
                                }

                                // Update due date for Override_1 if date is set
                                if ($date !== null) {
                                    $endTaskDate = date_create($date);
                                    $formattedDate = $endTaskDate->format('Y-m-d');
                                    $item['due_date'] = $formattedDate;
                                }

                                // Add details for Override_1 to $allDetails array
                                $project = Project::find($data['selectedProject']);
                                $allDetails[] = [
                                    'employeeName' => $item['Override_1'],
                                    'task_id' => $item['id'],
                                    'taskName' => $item['TaskName'],
                                    'usedDates' => $usedDates,
                                    'project_id' => $data['selectedProject'],
                                    'project_Name' => $project->ProjectName,
                                    'part_name' => $part->PartName,
                                ];

                                // Update $sub with $item data
                                $sub->update($item);
                            }
                        }
                        if ($sub->Algorithm_2 === null || $sub->Algorithm_2 === "") {
                            if ($item['Override_2'] === null && ($sub->Algorithm_2 === "" || $sub->Algorithm_2 === null) && $item['Algorithm_2'] !== null) {
                                // Logic for Algorithm_2
                                // Fetch employee and availability details for Algorithm_2
                                $emp = Employee::where('first_name', $item['Algorithm_2'])
                                    ->leftJoin('availabilities as a', 'a.employee_id', '=', 'employees.id')
                                    ->select('employees.first_name', 'employees.id', DB::raw('COUNT(a.id) as availability_count'), DB::raw('SUM(a.Total) as sotal'))
                                    ->groupBy('employees.id', 'employees.first_name')
                                    ->first();

                                // Retrieve availability for Algorithm_2
                                $ava = Availability::where('employee_id', $emp->id)
                                    ->whereBetween('date', [$item["Doc_Supply"], $item["Completion"]])
                                    ->orderBy('date', 'asc')
                                    ->get();

                                // Process availability data for Algorithm_2
                                $availabilityHours = intval(substr($emp->sotal, 0, 3));
                                $inputPlanHours = intval(substr($item["Plan"], 0, 3));
                                $date = null;
                                $usedDates = [];

                                foreach ($ava as $av) {
                                    list($hours, $minutes) = explode(':', $av->Total);
                                    $totalHours = $hours + ($minutes / 60);
                                    $remainingHours = $totalHours - $inputPlanHours;

                                    if ($remainingHours > 0) {
                                        $remainingHours = floor($remainingHours);
                                        $remainingMinutes = ($totalHours - $remainingHours) * 60;

                                        $remainingHours %= 24;
                                        $remainingMinutes %= 60;
                                        $formattedRemainingTime = sprintf('%02d:%02d', $remainingHours, $remainingMinutes);

                                        // $av->update(['Total' => $formattedRemainingTime]);
                                        $date = $av->date;
                                        $inputPlanHours = 0;
                                        $usedDates[] = ['date' => $av->date, 'subtractedHours' => min($inputPlanHours, $totalHours)];
                                    } else {
                                        // $av->update(['Total' => '00:00']);
                                        $inputPlanHours = (-1) * $remainingHours;
                                        $usedDates[] = ['date' => $av->date, 'planhrs' => $inputPlanHours, 'subtractedHours' => $totalHours];
                                    }
                                }

                                // Update due date for Algorithm_2 if date is set
                                if ($date !== null) {
                                    $endTaskDate = date_create($date);
                                    $formattedDate = $endTaskDate->format('Y-m-d');
                                    $item['due_date'] = $formattedDate;
                                }

                                // Add details for Algorithm_2 to $allDetails array
                                $project = Project::find($data['selectedProject']);
                                $allDetails[] = [
                                    'employeeName' => $item['Algorithm_2'],
                                    'task_id' => $item['id'],
                                    'taskName' => $item['TaskName'],
                                    'usedDates' => $usedDates,
                                    'project_id' => $data['selectedProject'],
                                    'project_Name' => $project->ProjectName,
                                    'part_name' => $part->PartName,
                                ];

                                // Update $sub with $item data
                                $sub->update($item);
                            } elseif ($sub->Override_2 !== null) {
                                // Logic for Override_2
                                // Fetch employee and availability details for Override_2
                                $emp = Employee::where('first_name', $sub->Override_2)
                                    ->leftJoin('availabilities as a', 'a.employee_id', '=', 'employees.id')
                                    ->select('employees.first_name', 'employees.id', DB::raw('COUNT(a.id) as availability_count'), DB::raw('SUM(a.Total) as sotal'))
                                    ->groupBy('employees.id', 'employees.first_name')
                                    ->first();

                                // Retrieve availability for Override_2
                                $ava = Availability::where('employee_id', $emp->id)
                                    ->whereBetween('date', [$item["Doc_Supply"], $item["Completion"]])
                                    ->orderBy('date', 'asc')
                                    ->get();

                                // Process availability data for Override_2
                                $availabilityHours = intval(substr($emp->sotal, 0, 3));
                                $inputPlanHours = intval(substr($item["Plan"], 0, 3));
                                $date = null;
                                $usedDates = [];

                                foreach ($ava as $av) {
                                    list($hours, $minutes) = explode(':', $av->Total);
                                    $totalHours = $hours + ($minutes / 60);
                                    $remainingHours = $totalHours - $inputPlanHours;

                                    if ($remainingHours > 0) {
                                        $remainingHours = floor($remainingHours);
                                        $remainingMinutes = ($totalHours - $remainingHours) * 60;

                                        $remainingHours %= 24;
                                        $remainingMinutes %= 60;
                                        $formattedRemainingTime = sprintf('%02d:%02d', $remainingHours, $remainingMinutes);

                                        // $av->update(['Total' => $formattedRemainingTime]);
                                        $date = $av->date;
                                        $inputPlanHours = 0;
                                        $usedDates[] = ['date' => $av->date, 'subtractedHours' => min($inputPlanHours, $totalHours)];
                                    } else {
                                        // $av->update(['Total' => '00:00']);
                                        $inputPlanHours = (-1) * $remainingHours;
                                        $usedDates[] = ['date' => $av->date, 'planhrs' => $inputPlanHours, 'subtractedHours' => $totalHours];
                                    }
                                }

                                // Update due date for Override_2 if date is set
                                if ($date !== null) {
                                    $endTaskDate = date_create($date);
                                    $formattedDate = $endTaskDate->format('Y-m-d');
                                    $item['due_date'] = $formattedDate;
                                }

                                // Add details for Override_2 to $allDetails array
                                $project = Project::find($data['selectedProject']);
                                $allDetails[] = [
                                    'employeeName' => $sub->Override_2,
                                    'task_id' => $item['id'],
                                    'taskName' => $item['TaskName'],
                                    'usedDates' => $usedDates,
                                    'project_id' => $data['selectedProject'],
                                    'project_Name' => $project->ProjectName,
                                    'part_name' => $part->PartName,
                                ];

                                // Update $sub with $item data
                                $sub->update($item);
                            }
                        }
                        if ($sub->Algorithm_2 === null || $sub->Algorithm_2 === "") {
                            if ($sub->Override_3 !== null) {
                                // Logic for Override_3
                                // Fetch employee and availability details for Override_3
                                $emp = Employee::where('first_name', $sub->Override_3)
                                    ->leftJoin('availabilities as a', 'a.employee_id', '=', 'employees.id')
                                    ->select('employees.first_name', 'employees.id', DB::raw('COUNT(a.id) as availability_count'), DB::raw('SUM(a.Total) as sotal'))
                                    ->groupBy('employees.id', 'employees.first_name')
                                    ->first();

                                // Retrieve availability for Override_3
                                $ava = Availability::where('employee_id', $emp->id)
                                    ->whereBetween('date', [$item["Doc_Supply"], $item["Completion"]])
                                    ->orderBy('date', 'asc')
                                    ->get();

                                // Process availability data for Override_3
                                $availabilityHours = intval(substr($emp->sotal, 0, 3));
                                $inputPlanHours = intval(substr($item["Plan"], 0, 3));
                                $date = null;
                                $usedDates = [];

                                foreach ($ava as $av) {
                                    list($hours, $minutes) = explode(':', $av->Total);
                                    $totalHours = $hours + ($minutes / 60);
                                    $remainingHours = $totalHours - $inputPlanHours;

                                    if ($remainingHours > 0) {
                                        $remainingHours = floor($remainingHours);
                                        $remainingMinutes = ($totalHours - $remainingHours) * 60;

                                        $remainingHours %= 24;
                                        $remainingMinutes %= 60;
                                        $formattedRemainingTime = sprintf('%02d:%02d', $remainingHours, $remainingMinutes);

                                        // $av->update(['Total' => $formattedRemainingTime]);
                                        $date = $av->date;
                                        $inputPlanHours = 0;
                                        $usedDates[] = ['date' => $av->date, 'subtractedHours' => min($inputPlanHours, $totalHours)];
                                    } else {
                                        // $av->update(['Total' => '00:00']);
                                        $inputPlanHours = (-1) * $remainingHours;
                                        $usedDates[] = ['date' => $av->date, 'planhrs' => $inputPlanHours, 'subtractedHours' => $totalHours];
                                    }
                                }

                                // Update due date for Override_3 if date is set
                                if ($date !== null) {
                                    $endTaskDate = date_create($date);
                                    $formattedDate = $endTaskDate->format('Y-m-d');
                                    $item['due_date'] = $formattedDate;
                                }

                                // Add details for Override_3 to $allDetails array
                                $project = Project::find($data['selectedProject']);
                                $allDetails[] = [
                                    'employeeName' => $sub->Override_3,
                                    'task_id' => $item['id'],
                                    'taskName' => $item['TaskName'],
                                    'usedDates' => $usedDates,
                                    'project_id' => $data['selectedProject'],
                                    'project_Name' => $project->ProjectName,
                                    'part_name' => $part->PartName,
                                ];

                                // Update $sub with $item data
                                $sub->update($item);
                            }
                        }
                    }
                    if ((empty($item["Algorithm_1"]) || $item["Algorithm_1"] === $sub["Algorithm_1"]) &&
                        (empty($item["Algorithm_2"]) || $item["Algorithm_2"] === $sub["Algorithm_2"])
                    ) {
                        $sub->update($item);
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

                        TaskAssignment::updateOrCreate(
                            [
                                'task_id' => $task['task_id'],
                                'parts_id' => $task['part_id'],
                                'Hrs' => $assignment['hours_assigned'] ?? 0,
                                'employee' => $assignment['employee'] ?? 'Unknown',
                                'date' => $assignment['date'] ?? Carbon::now()->format('Y-m-d'),
                            ],
                            [
                                'task_name' => $task['task_name'] ?? 'Unnamed Task',
                            ]
                        );
                        $employeeName = $assignment['employee'] ?? 'Unknown';
                        $assignmentDate = $assignment['date'] ?? Carbon::now()->format('Y-m-d');

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

                        // Store employee assignment data
                        $employeesData[] = [
                            'employee_name' => $employeeName,
                            'Hrs' => $assignment['hours_assigned'] ?? 0,
                            'Start_date' => $assignmentDate,
                            'End_date' => $assignmentDate,
                        ];
                    }

                    // Loop through each employee and update or create Gantt entries
                    foreach ($employeeStartEndDates as $employeeName => $dates) {
                        // Fetch the part and its associated project
                        $part = Part::with('project')->find($task['part_id']);

                        // Determine the project details dynamically
                        $projectName = $part && $part->project ? $part->project->ProjectName : 'Unnamed Project';
                        $projectId = $part && $part->project ? $part->project->id : null; // Fetch the project ID if it exists
                        $partName = $part ? $part->PartName : 'Unnamed Part'; // Fetch the part name if it exists

                        // Update or create the Gantt record
                        Gantt::updateOrCreate(
                            [
                                'task_id' => $task['task_id'], // Ensure uniqueness on 'task_id' and 'employee_name'
                                'employee_name' => $employeeName, // Create entry for each employee individually
                            ],
                            [
                                'Task_name' => $task['task_name'] ?? 'Unnamed Task',
                                'Start_date' => $dates['start_date'], // Start date for the current employee
                                'End_date' => $dates['end_date'], // End date for the current employee
                                'project_Name' => $projectName, // Use the dynamically fetched project name
                                'project_id' => $projectId, // Use the dynamically fetched project ID
                                'part_Name' => $partName, // Use the dynamically fetched part name
                                'part_id' => $task['part_id'],
                            ]
                        );
                    }
                }
            }
        }







        $sortedProjects = Project::with(['parts.subs' => function ($query) {
            // No need to order by 'Pri' in SQL since we are sorting in PHP.
        }])
            ->get();

        $TS = [];

        foreach ($sortedProjects as $project) {
            foreach ($project->parts as $part) {
                foreach ($part->subs as $sub) {
                    $TS[] =
                        [
                            'TaskName' => $sub->TaskName,
                            'employee_name' => $sub->Algorithm_1,
                            'RAP' => $sub->RAP,
                            'Pri' => $sub->Pri
                        ];
                }
            }
        }

        // Sort the $TS array by 'Pri' in ascending order
        usort($TS, function ($a, $b) {
            return $a['Pri'] <=> $b['Pri'];
        });

        // Now, $TS is sorted by 'Pri' in ascending order

        return response()->json(['message' => 'Data saved successfully', 'sortedSubs' => $cachedTasks], 200);
    }
    //algorithem
    public function runalgori(Request $request)
    {
        try {
            // Step 1: Collect all employees with sorted availabilities and necessary data
            $allEmployees = Employee::with([
                'availabilities' => function ($query) {
                    $query->orderBy('date', 'asc');
                },
                'tt_hrs',
                'nrms' => function ($query) {
                    $query->orderBy('OAP', 'asc');
                }
            ])->get();
    
            // Step 2: Collect tasks, flatten structure, and sort by priority
            $tasks = Project::with(['parts.subs' => function ($query) {
                $query->select('id', 'TaskName', 'PP', 'RAP', 'Pri', 'Doc_Supply', 'Completion', 'TS', 'Plan', 'Algorithm_1', 'Algorithm_2', 'DD', 'parts_id')
                    ->orderBy('Pri', 'asc');
            }])->get()->flatMap(function ($project) {
                return $project->parts->flatMap(function ($part) {
                    return $part->subs->map->toArray();
                });
            })->sortBy('Pri')->values()->toArray();
    
            // Step 3: Filter tasks based on criteria (e.g., valid plan hours)
            $filteredTasks = collect($tasks)->filter(function ($task) {
                return !empty($task['Plan']) && $task['Plan'] > 0;
            })->values()->toArray();
    
            // Initialize arrays to store processed data
            $allCandidatesPerTask = [];
            $assignments = []; // Array to track assignments
    
            // Step 4: Process each filtered task
            foreach ($filteredTasks as &$task) {
                $number = $this->extractNumberFromTaskName($task['TaskName']);
                $potentialCandidates = [];
                $assignedEmployee = null;
    
                // Step 5: Find qualified employees for the task
                foreach ($allEmployees as $employee) {
                    $filteredNrms = $employee->nrms->filter(fn($nrm) => $nrm->number == $number);
    
                    if ($filteredNrms->isNotEmpty()) {
                        $filteredAvailabilities = $employee->availabilities->filter(function ($availability) use ($task) {
                            return $availability->date >= $task['Doc_Supply'] && $availability->date <= $task['Completion'];
                        });
    
                        if ($filteredAvailabilities->isNotEmpty()) {
                            $potentialCandidates[] = [
                                'employee_id' => $employee->id,
                                'employee_name' => $employee->first_name,
                                'availability_dates' => $filteredAvailabilities->pluck('date')->toArray()
                            ];
                        }
                    }
                }
    
                // Step 6: Assign a candidate if none have hours on the start date
                $startDate = $task['Doc_Supply'];
                $availableCandidates = collect($potentialCandidates)->filter(function ($candidate) use ($startDate) {
                    return !in_array($startDate, $candidate['availability_dates']);
                });
    
                if ($availableCandidates->isNotEmpty()) {
                    $bestCandidate = $availableCandidates->first(); // Select the first suitable candidate
                    $assignedEmployee = $bestCandidate;
                } elseif (!empty($potentialCandidates)) {
                    $assignedEmployee = $potentialCandidates[0]; // Fallback to the first candidate if all have hours
                }
    
                // Track assignment if an employee was assigned
                if ($assignedEmployee) {
                    $assignments[] = [
                        'task_id' => $task['id'],
                        'task_name' => $task['TaskName'],
                        'employee_id' => $assignedEmployee['employee_id'],
                        'employee_name' => $assignedEmployee['employee_name']
                    ];
                }
    
                // Track candidates for the task
                $allCandidatesPerTask[] = [
                    'task_id' => $task['id'],
                    'task_name' => $task['TaskName'],
                    'candidates' => collect($potentialCandidates)->pluck('employee_name')->toArray()
                ];
            }
    
            // Cache the results
            Cache::forever('cachedData', [
                'filteredTasks' => $filteredTasks, // Include filtered tasks in cached data
                'allCandidatesPerTask' => $allCandidatesPerTask,
                'assignments' => $assignments
            ]);
    
            return response()->json([
                'message' => 'Algorithm executed successfully',
                'filteredTasks' => $filteredTasks,
                'allCandidatesPerTask' => $allCandidatesPerTask,
                'assignments' => $assignments // Return assignments for tracking
            ]);
    
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error executing algorithm',
                'error' => $e->getMessage()
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
            if (($taskStartDate >= $assignedTask->start_date && $taskStartDate <= $assignedTask->end_date) ||
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
