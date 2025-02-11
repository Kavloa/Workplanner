<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'ProjectName','Color'
    ];

    public function parts()
    {
        return $this->hasMany(Part::class,'projects_id');
    }

}
