<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    /**
     * The function creates a table called alerts with a primary key called id, a foreign key called
     * userID that references the id column in the users table, a string called message, a string
     * called type, a boolean called seen, and a dateTime called sentDate
     */
    public function up()
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('userID');
            $table->string('message', 300);
            $table->string('type');
            $table->boolean('seen')->default(false);
            $table->dateTime('sentDate');
            $table->foreign('userID')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('alerts');
    }
};
