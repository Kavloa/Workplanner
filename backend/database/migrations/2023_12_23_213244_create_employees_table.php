<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CreateEmployeesTable extends Migration
{
    public function up()
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('Team')->nullable();
            $table->string('OAP');
            $table->timestamps();
        });
        DB::table('employees')->insert([
            ['first_name' => 'Kostadin R', 'OAP' => 1],
            ['first_name' => 'Abdelsattar A', 'OAP' => 1.5],
            ['first_name' => 'Alexander S', 'OAP' => 2],
            ['first_name' => 'Mina Tarek', 'OAP' => 2.5],
            ['first_name' => 'Todor T', 'OAP' => 3],
            ['first_name' => 'Shaimaa M', 'OAP' => 3.5],
            ['first_name' => 'Gabriel G', 'OAP' => 4],
            ['first_name' => 'Manu V', 'OAP' => 4.5],
            ['first_name' => 'Khaled M', 'OAP' => 5],
            ['first_name' => 'B-team KM', 'OAP' => 5.5],
            ['first_name' => 'Fouad D', 'OAP' => 6],
            ['first_name' => 'Valeria D', 'OAP' => 6.5],
            ['first_name' => 'Veselina M', 'OAP' => 7],
            ['first_name' => 'Amro H', 'OAP' => 7.5],
            ['first_name' => 'B-team AH', 'OAP' => 8],
            ['first_name' => 'Rehaf H', 'OAP' => 8.5],
            ['first_name' => 'Stanley P', 'OAP' => 9],
            ['first_name' => 'Mayar N', 'OAP' => 9.5],
            ['first_name' => 'Amal', 'OAP' => 10],
            ['first_name' => 'Nada', 'OAP' => 10.5],
            ['first_name' => 'Rauno R', 'OAP' => 11],
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('employees');
    }
}
