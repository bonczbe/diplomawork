<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * It creates a table called group_posts with the following columns: id, who, text, groupID,
     * isFile, date.
     * 
     * The id column is the primary key and is auto-incremented.
     * 
     * The who column is a foreign key that references the memberID column in the group_members table.
     * 
     * The groupID column is a foreign key that references the id column in the groups table.
     * 
     * The isFile column is a boolean that defaults to false.
     * 
     * The date column is a dateTime.
     * 
     * The text column is a string with a maximum length of 2048 characters.
     */
    public function up()
    {
        Schema::create('group_posts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('who');
            $table->string('text',3000);
            $table->unsignedBigInteger('groupID');
            $table->boolean('isFile')->default(false);
            $table->dateTime('date');
            $table->foreign('who')->references('memberID')->on('group_members')->onDelete('cascade');
            $table->foreign('groupID')->references('id')->on('groups')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('group_posts');
    }
};
