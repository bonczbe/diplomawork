<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * Create a table called groupchats with a column called actualProfilePicID that references the id
     * column of the profile_pics table and deletes the referenced row if the row in the groupchats
     * table is deleted.
     */
    public function up()
    {
        Schema::create('groupchats', function (Blueprint $table) {
            $table->id();
            $table->string('name',32);
            $table->unsignedBigInteger('actualProfilePicID')->default(1);;
            $table->foreign('actualProfilePicID')->references('id')->on('profile_pics');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('groupchats');
    }
};
