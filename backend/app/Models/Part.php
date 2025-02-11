<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Part extends Model
{
    protected $fillable = ['PartName', 'projects_id'];

    public function project()
    {
        return $this->belongsTo(Project::class, 'projects_id');
    }
    public function subs()
    {
        return $this->hasMany(Sub::class,"parts_id");
    }
}
