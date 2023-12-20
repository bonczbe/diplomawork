<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * It creates a table called relations with a primary key called id, two foreign keys called
     * user1ID and user2ID, an integer called who, and an integer called type
     */
    public function up()
    {
        Schema::create('relations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user1ID');
            $table->unsignedBigInteger('user2ID');
            $table->unsignedBigInteger('who'); //Who interacted with who
            $table->integer('type'); // 0 Added,1 Friend, 2 CloseFriend , 3 FamilyMember, 4 blocked
            $table->foreign('user1ID')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('user2ID')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('relations');
    }
};
