<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * It creates a table called pages with the following columns: id, name, description, webURI,
     * phone, email, place, businessType, businessHours, actualProfilePicID, actualWallPaperID.
     * 
     * The actualProfilePicID and actualWallPaperID columns are foreign keys that reference the id
     * column of the profile_pics and wall_papers tables respectively.
     * 
     * The actualProfilePicID and actualWallPaperID columns are also set to cascade on delete.
     * 
     * The actualProfilePicID and actualWallPaperID columns are also set to default to 1.
     * 
     * The businessHours column is set to 4096 characters.
     * 
     * The place, businessType, businessHours, actualProfilePicID, and actualWallPaperID columns are
     * set to nullable.
     * 
     * The webURI, phone, and email columns are set to 255 characters.
     * 
     * The description column is
     */
    public function up()
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('name',32);
            $table->string('description',50);
            $table->string('webURI',64)->nullable();
            $table->string('place',32)->nullable();
            $table->string('phone',12)->nullable();
            $table->string('email',32)->nullable();
            $table->string('businessType',32)->nullable();
            $table->string('businessHours',4096)->nullable();
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
        Schema::dropIfExists('pages');
    }
};
