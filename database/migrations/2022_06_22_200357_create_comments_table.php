<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * The above function creates a table called comments with the following columns: id, postID,
     * userID, what, date. The postID and userID columns are foreign keys that reference the id column
     * in the posts and users tables respectively.
     */
    public function up()
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('postID');
            $table->unsignedBigInteger('userID');
            $table->string('what',3000);
            $table->dateTime('date');
            $table->foreign('userID')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('postID')->references('id')->on('posts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('comments');
    }
};
