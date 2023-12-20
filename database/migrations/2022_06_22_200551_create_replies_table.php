<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * It creates a table called 'replies' with a primary key called 'id', two foreign keys called
     * 'userID' and 'commentID', a string called 'what' and a dateTime called 'date'.
     */
    public function up()
    {
        Schema::create('replies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('commentID');
            $table->unsignedBigInteger('userID');
            $table->string('what',3000);
            $table->dateTime('date');
            $table->foreign('userID')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('commentID')->references('id')->on('comments')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('replies');
    }
};
