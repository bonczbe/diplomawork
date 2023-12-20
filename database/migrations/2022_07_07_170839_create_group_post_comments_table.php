<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    /**
     * It creates a table called group_post_comments with an id, a postID, a userID, a what, a date,
     * and two foreign keys.
     *
     * The first foreign key is userID and it references the id column in the users table.
     *
     * The second foreign key is postID and it references the id column in the group_posts table.
     *
     * The foreign keys are also set to cascade on delete.
     */
    public function up()
    {
        Schema::create('group_post_comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('postID');
            $table->unsignedBigInteger('userID');
            $table->string('what',3000);
            $table->dateTime('date');
            $table->foreign('userID')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('postID')->references('id')->on('group_posts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('group_post_comments');
    }
};
