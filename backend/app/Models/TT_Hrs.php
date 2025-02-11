<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TT_Hrs extends Model
{
    use HasFactory;

    // Define the table name if it's different from the plural of the model name
    protected $table = 'tt_hrs';

    // Define the fillable fields
    protected $fillable = [
        'employee_id',
        'date',
        'hours_worked',
        // Add other fields as necessary
    ];

    // Define relationships (if any)
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
