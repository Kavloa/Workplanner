<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Opp extends Model
{
    protected $table = 'opp'; // Replace with your actual table name
    protected $fillable = ['name', 'nrmSection']; // Fillable fields in your table
}
