<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    /**
     * It creates a table called page_post_comments with an id, a postID, a userID, a text, a date, and
     * two foreign keys.
     */
    public function up()
    {
        Schema::create('page_post_comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('postID');
            $table->unsignedBigInteger('userID');
            $table->string('text',3000);
            $table->dateTime('date');
            $table->foreign('userID')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('postID')->references('id')->on('pages_posts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('page_post_comments');
    }
};
