<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = ['first_name', 'team_id'];

    // Define the relationship with Availabilities
    public function availabilities()
    {
        return $this->hasMany(Availability::class, "employee_id");
    }

    // Define the relationship with the Team
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    // Define the relationship with Nrms
    public function nrms()
    {
        return $this->belongsToMany(Nrm::class, 'employee_nrm')
                    ->withPivot('OAP');
    }

    // Define the relationship with TT_Hrs
    public function tt_hrs()
    {
        return $this->hasMany(TT_Hrs::class, 'employee_id');
    }
}
