<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subs', function (Blueprint $table) {
            $table->id();
            $table->string('TaskName');
            $table->string('Est')->nullable();
            $table->string('DL')->nullable();
            $table->string('RFI')->nullable();
            $table->string('PD')->nullable();
            $table->string('Buf')->nullable();
            $table->string('Adj')->nullable();
            $table->string('Doc_Supply')->nullable();
            $table->string('Completion')->nullable();
            $table->string('due_date')->nullable();
            $table->string('RAP')->nullable();
            $table->string('Pri')->nullable();
            $table->string('TS')->nullable();
            $table->string('DD')->nullable();
            $table->string('SP')->nullable();
            $table->string('Algorithm_1')->nullable();
            $table->string('Algorithm_2')->nullable();
            $table->string('Override_1')->nullable();
            $table->string('Override_2')->nullable();
            $table->string('Override_3')->nullable();
            $table->string('Color')->nullable();
            $table->Integer('C_per')->nullable();
            $table->Integer('Plan1')->nullable();
            $table->Integer('Plan2')->nullable();
            $table->Integer('duration')->nullable();
            $table->Integer('Act')->nullable();
            $table->Integer('left_1')->nullable();
            $table->Integer('per')->nullable();
            $table->Integer('Updated')->nullable();
            $table->Integer('left_2')->nullable();
            $table->unsignedBigInteger('parts_id')->nullable();
            $table->foreign('parts_id')->references('id')->on('parts'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subs');
    }
};
