<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gantt extends Model
{    protected $table = 'gantt'; // specify the table name

    protected $fillable = [ 'project_Name','project_id','task_id','Task_name','employee_name','part_id','Hrs','Start_date','C_per','End_date'];
}
