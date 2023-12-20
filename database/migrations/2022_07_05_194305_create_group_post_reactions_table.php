<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * The above function creates a table called group_post_reactions with the following columns: id,
     * outsideID, typeofdata, typeOfAction, userID. The userID column is a foreign key that references
     * the id column in the users table
     */
    public function up()
    {
        Schema::create('group_post_reactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('outsideID');
            $table->string('typeofdata');
            $table->string('typeOfAction');
            $table->unsignedBigInteger('userID');
            $table->foreign('userID')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('group_post_reactions');
    }
};
