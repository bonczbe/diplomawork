<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    /**
     * It creates a table called reports with the following columns: id, outsideID, type, checked,
     * whoChecked, userID.
     * 
     * The id column is the primary key and is auto-incremented.
     * 
     * The outsideID column is a foreign key that references the id column in the users table.
     * 
     * The type column is a string.
     * 
     * The checked column is a boolean that defaults to false.
     * 
     * The whoChecked column is a foreign key that references the id column in the supervisors table.
     * 
     * The userID column is a foreign key that references the id column in the users table.
     */
    public function up()
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('outsideID'); //Like normalPost -> posts.id, groupPost -> group_posts.id
            $table->string('type'); // normalPost, groupPost, pagePost, normalComment, pageComment, groupComment, normalReply, groupReply, pageReply, profilePic, wallPapaer, history, PostImage, normalPostImage, groupPostImage, pagePostImage
            $table->dateTime('reportDate');
            $table->boolean('checked')->default(false);
            $table->unsignedBigInteger('whoChecked')->nullable();
            $table->unsignedBigInteger('userID');
            $table->foreign('userID')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('whoChecked')->references('id')->on('supervisors')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('reports');
    }
};
