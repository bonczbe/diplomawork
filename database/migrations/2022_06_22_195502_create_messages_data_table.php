<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * It creates a table called messages_data with a bunch of columns.
     */
    public function up()
    {
        Schema::create('messages_data', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('whouserID');
            $table->unsignedBigInteger('messageID');
            $table->string('textURI',2048);
            $table->boolean('seen')->default(false);
            $table->dateTime('seenData')->nullable();
            $table->dateTime('sentData');
            $table->boolean('isFile')->default(false);
            $table->foreign('whouserID')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('messageID')->references('id')->on('messages')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('messages_data');
    }
};
