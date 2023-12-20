<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * The function creates a table called posts with a primary key called id, a foreign key called
     * userID that references the id column in the users table, a string called text, a boolean called
     * isFile, and a dateTime called date
     */
    public function up()
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('userID');
            $table->string('text',3000)->nullable();
            $table->boolean('isFile')->default(false);
            $table->dateTime('date')->default(Carbon::now());
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
        Schema::dropIfExists('posts');
    }
};
