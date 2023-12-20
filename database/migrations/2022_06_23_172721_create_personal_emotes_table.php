<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * Create a table called personal_emotes with a user column that references the id column in the
     * users table and delete the row in the personal_emotes table if the row in the users table is
     * deleted.
     */
    public function up()
    {
        Schema::create('personal_emotes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user');
            $table->string('name');
            $table->string('emoteURI')->unique();
            $table->foreign('user')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('personal_emotes');
    }
};
