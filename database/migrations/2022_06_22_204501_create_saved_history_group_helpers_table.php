<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * It creates a table called saved_history_group_helpers with two foreign keys.
     */
    public function up()
    {
        Schema::create('saved_history_group_helpers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('GroupID');
            $table->unsignedBigInteger('historyID');
            $table->foreign('GroupID')->references('id')->on('saved_history_groups')->onDelete('cascade');
            $table->foreign('historyID')->references('id')->on('histories')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('saved_history_group_helpers');
    }
};
