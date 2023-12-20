<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * It creates a table called pages_post_reactions with the following columns: id, outsideID,
     * typeofdata, typeOfAction, userID.
     */
    public function up()
    {
        Schema::create('pages_post_reactions', function (Blueprint $table) {
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
        Schema::dropIfExists('pages_post_reactions');
    }
};
