<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AvailabilityImport extends Model
{
    use HasFactory;

    protected $table = 'availabilities'; // Ensure the table name matches your database

    protected $fillable = [
        'date',
        'strt1',
        'end1',
        'strt2',
        'end2',
        'strt3',
        'end3',
        'strt4',
        'end4',
        'Total',
        'total_ava',
        'employee_id',
    ];
}
