<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sub extends Model
{
    protected $fillable = [
        'TaskName', 'Est', 'DL', 'RFI', 'PD', 'Buf', 'Adj', 'Doc_Supply',
        'Completion','PP', 'due_date', 'RAP', 'Pri', 'TS', 'DD', 'SP','Plan',
        'Algorithm_1', 'Algorithm_2', 'Override_1', 'Override_2', 'Override_3', 'Color',
        'C_per', 'Plan1', 'Plan2', 'duration', 'Act', 'left_1', 'per', 'Updated', 'left_2', 'parts_id','endtask','algo_start','algo_end'
    ];

    public function part()
    {
        return $this->belongsTo(Part::class, 'parts_id');
    }
}


