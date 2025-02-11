<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAvailabilitiesTable extends Migration
{
    public function up()
    {
        Schema::create('availabilities', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('strt1');
            $table->string('end1');
            $table->string('strt2');
            $table->string('end2');
            $table->string('strt3');            
            $table->string('end3');
            $table->string('strt4');            
            $table->string('end4');
            $table->Integer('Total');
            $table->unsignedBigInteger('employee_id');
            $table->foreign('employee_id')->references('id')->on('employees'); 
            $table->timestamps();
        });
        
    }

    public function down()
    {
        Schema::dropIfExists('availabilities');
    }
}
