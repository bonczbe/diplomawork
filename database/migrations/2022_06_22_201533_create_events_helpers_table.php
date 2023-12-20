<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * Create a table called events_helpers with a primary key called id, two foreign keys called
     * userID and eventID, and two integers called role and status.
     */
    public function up()
    {
        Schema::create('events_helpers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('eventID');
            $table->unsignedBigInteger('userID');
            $table->integer('role');            // 0 owner, 1 admin, 2 will be there, 3 might be, 4 won't be there, 5 blocked
            $table->foreign('userID')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('eventID')->references('id')->on('events')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('events_helpers');
    }
};
