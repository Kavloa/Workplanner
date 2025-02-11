<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTaskAssignmentsTable extends Migration
{
    public function up()
    {
        Schema::create('task_assignments', function (Blueprint $table) {
            $table->id(); // Primary Key
            $table->integer('task_id')->index(); // Task ID
            $table->integer('parts_id')->index(); // Task ID
            $table->string('task_name', 100); // Task Name
            $table->string('employee', 100)->index(); // Employee Name
            $table->date('date')->index(); // Assignment Date
            $table->date('start_date_primary')->nullable(); // Start Date
            $table->date('end_date_primary')->nullable(); // End Date
            $table->timestamps(); // Created At and Updated At
        });
    }

    public function down()
    {
        Schema::dropIfExists('task_assignments');
    }
}
