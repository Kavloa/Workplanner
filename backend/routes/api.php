<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\NrmController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SubController;
use App\Http\Controllers\Api\PartController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\OppController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TT_HrsController;
use App\Http\Controllers\AvailabilityImportController;
Route::post('/availabilitiesImport', [AvailabilityImportController::class, 'store']);


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route::get('/{any}', function () {
//     return view('react');
// })->where('any', '.*');


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/opps', [OppController::class, 'index']);
Route::post('/availabilityy', [EmployeeController::class, 'store']);
Route::delete('/availability/{id}', [EmployeeController::class, 'destroy']);
Route::put('/availability/{id}', [EmployeeController::class, 'update']);
Route::post('/duplicate/{id}', [EmployeeController::class, 'duplicate']);


Route::delete('/teams/{team}', [TeamController::class, 'delete']);
Route::post('/teams', [TeamController::class, 'store']);
Route::put('/teams/{id}', [TeamController::class, 'update']);
Route::get('/teams', [TeamController::class, 'getall']);


Route::post('/nrms', [NrmController::class, 'store']);
Route::get('/nrms', [NrmController::class, 'getall']);
Route::delete('/nrms/{id}', [NrmController::class, 'delete']);
Route::put('/nrms/{id}', [NrmController::class, 'update']);

Route::post('/project/copy', [ProjectController::class, 'copy']);

Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/subs/{id}', [SubController::class, 'index']);
Route::get('/parts/{id}', [PartController::class, 'index']);
Route::post('/subs', [SubController::class, 'store']);
Route::post('/savedata', [SubController::class, 'saved']);
Route::post('/runalgori', [SubController::class, 'runalgori']);
Route::get('/gethost', [EmployeeController::class, 'gethost']);
Route::post('/parts/name', [PartController::class, 'indexname']);

Route::get('/employees/total-hours', [EmployeeController::class, 'getEmployeeTotalHours']);

Route::post('/saveEmployee', [EmployeeController::class, 'saveemploye']);
Route::post('/delete-employees', [EmployeeController::class, 'deleteEmployees']);

Route::delete('/projects', [ProjectController::class, 'delete']);
Route::delete('/parts', [PartController::class, 'delete']);
Route::post('/delete-tasks', [PartController::class, 'deletesubs']);


Route::get('/tasks', [TaskController::class, 'getTasks']);


Route::post('availability/update', [EmployeeController::class, 'update2']);


Route::post('/login', [UserController::class, 'login']);
Route::resource('tt_hrs', TT_HrsController::class);



use App\Http\Controllers\GanttController;

Route::get('/gantt/task/{taskId}', [GanttController::class, 'getByTaskId']); // Get assignments by task ID
Route::get('/gantt/employee/{employee}', [GanttController::class, 'getByEmployee']); // Get assignments by employee




// ----------------------------------------------------------------
//Gantt routes
Route::get('/employees', [EmployeeController::class, 'index']);
Route::get('/gantt', [GanttController::class, 'index']); // Get all assignments
Route::get('/getemploye', [EmployeeController::class, 'getemploye']);
Route::post('/gethost', [EmployeeController::class, 'gethost2']);




