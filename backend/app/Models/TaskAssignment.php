<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'parts_id',
        'task_name',
        'employee',
        'Hrs',
        'date',
        'start_date_primary',
        'end_date_primary',
    ];
}
