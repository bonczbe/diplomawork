<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * It creates a table called events with the following columns: id, name, description, place,
     * pageURL, startDate, endDate, actualProfilePicID, actualWallPaperID.
     * 
     * The id column is the primary key and is auto-incremented.
     * 
     * The name, description, place, pageURL columns are all strings with the specified lengths.
     * 
     * The startDate and endDate columns are both dateTime columns.
     * 
     * The actualProfilePicID and actualWallPaperID columns are both unsignedBigInteger columns.
     * 
     * The actualProfilePicID column has a default value of 1.
     * 
     * The actualWallPaperID column has a default value of 1.
     * 
     * The actualWallPaperID column references the id column of the wall_papers table and is deleted
     * when the referenced row is deleted.
     * 
     * The actualProfilePicID column references the id column
     */
    public function up()
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('name',32);
            $table->string('description',50);
            $table->string('place',32)->nullable();
            $table->string('pageURL',64)->nullable();
            $table->dateTime('startDate');
            $table->dateTime('endDate');
            $table->unsignedBigInteger('actualProfilePicID')->default(1);
            $table->unsignedBigInteger('actualWallPaperID')->default(1);
            $table->foreign('actualProfilePicID')->references('id')->on('profile_pics');
            $table->foreign('actualWallPaperID')->references('id')->on('wall_papers');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('events');
    }
};
