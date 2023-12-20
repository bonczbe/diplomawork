<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * It creates a table called groupmessages with a primary key called id, a foreign key called
     * userID that references the id column in the users table, a foreign key called groupChatID that
     * references the id column in the groupchats table, a dateTime column called date, a string column
     * called textURI, and a boolean column called isFile.
     */
    public function up()
    {
        Schema::create('groupmessages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('userID');
            $table->unsignedBigInteger('groupChatID');
            $table->dateTime('date');
            $table->string('textURI',2048);
            $table->boolean('isFile')->default(false);
            $table->foreign('userID')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('groupChatID')->references('id')->on('groupchats')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('groupmessages');
    }
};