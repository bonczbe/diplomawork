<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * Create a table called posts_actions with an id, outsideID, typeofdata, typeOfAction, and userID,
     * where userID is a foreign key referencing the id column in the users table, and
     * onDelete('cascade').
     */
    public function up()
    {
        Schema::create('posts_actions', function (Blueprint $table) {
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
        Schema::dropIfExists('posts_actions');
    }
};
