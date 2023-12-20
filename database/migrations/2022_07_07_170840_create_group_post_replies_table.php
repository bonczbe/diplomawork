<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * It creates a table called group_post_replies with a primary key called id, a foreign key called
     * commentID that references the id column in the group_post_comments table, a foreign key called
     * userID that references the id column in the users table, a string called what that can be null,
     * and a dateTime called date.
     */
    public function up()
    {
        Schema::create('group_post_replies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('commentID');
            $table->unsignedBigInteger('userID');
            $table->string('what',4096);
            $table->dateTime('date');
            $table->foreign('userID')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('commentID')->references('id')->on('group_post_comments')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('group_post_replies');
    }
};
