<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * It creates a table called pages_post_replies with an id, a commentID, a userID, a what, a date,
     * and two foreign keys.
     */
    public function up()
    {
        Schema::create('pages_post_replies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('commentID');
            $table->unsignedBigInteger('userID');
            $table->string('what',4096);
            $table->dateTime('date');
            $table->foreign('userID')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('commentID')->references('id')->on('page_post_comments')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pages_post_replies');
    }
};
