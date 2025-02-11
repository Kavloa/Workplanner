<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Availability extends Model
{
    use HasFactory;

    protected $fillable = ['date', 'strt1', 'end1', 'strt2', 'end2', 'strt3', 'end3', 'strt4', 'end4', 'Total', 'total_ava', 'employee_id'];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    // Model event to update total_ava when Total is updated
    // protected static function boot()
    // {
    //     parent::boot();

    //     static::updating(function ($availability) {
    //         // Check if Total is being updated
    //         if ($availability->isDirty('Total')) {
    //             // Update total_ava accordingly
    //             $availability->total_ava = $availability->Total;
    //         } elseif ($availability->isDirty('total_ava')) {
    //             // Update Total accordingly
    //             $availability->Total = $availability->total_ava;
    //         }
    //     });
    // }
}
