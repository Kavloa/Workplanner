<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Nrm extends Model
{
    use HasFactory;
    protected $table = 'nrm';

    protected $fillable = [
        'number',
    ];

    public function employees()
    {
        return $this->belongsToMany(Employee::class, 'employee_nrm')
                    ->withPivot('OAP');
    }

}
