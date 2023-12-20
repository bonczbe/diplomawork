<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * Create a table called pages_helpers with an id, userID, pageID, rank, and two foreign keys.
     */
    public function up()
    {
        Schema::create('pages_helpers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('userID');
            $table->unsignedBigInteger('pageID');
            $table->integer('rank'); // 1: user, 2: admin, 3:owner, 4 blocked
            $table->foreign('pageID')->references('id')->on('pages')->onDelete('cascade');
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
        Schema::dropIfExists('pages_helpers');
    }
};
