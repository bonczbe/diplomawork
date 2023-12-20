<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create a table called messages with a primary key called id, two foreign keys called user1ID and
     * user2ID, and two foreign keys that reference the id column in the users table.
     */
    
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user1ID');
            $table->unsignedBigInteger('user2ID');
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
        Schema::dropIfExists('messages');
    }
};
