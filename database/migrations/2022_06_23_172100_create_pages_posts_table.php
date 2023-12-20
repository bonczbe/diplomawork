<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * It creates a table called pages_posts with the following columns: id, pageID, who, text, isFile,
     * date.
     * 
     * The id column is the primary key and is auto-incremented.
     * 
     * The pageID column is a foreign key that references the id column in the pages table.
     * 
     * The who column is a foreign key that references the id column in the users table.
     * 
     * The text column is a string with a maximum length of 2048 characters.
     * 
     * The isFile column is a boolean that defaults to false.
     * 
     * The date column is a date and time.
     */
    public function up()
    {
        Schema::create('pages_posts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pageID');
            $table->unsignedBigInteger('who');
            $table->string('text',3000);
            $table->boolean('isFile')->default(false);
            $table->dateTime('date');
            $table->foreign('who')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('pageID')->references('id')->on('pages')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pages_posts');
    }
};
