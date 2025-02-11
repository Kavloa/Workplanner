<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\OppController;
// Route::get('/', [EmployeeController::class, 'index'])->name('EmployeeController.index');

Route::get('/gantt', function () {
    return view('gantt');
});



Route::get('/subs', function () {
    return view('subs');
});




Route::get('/opps', [OppController::class, 'index']);

