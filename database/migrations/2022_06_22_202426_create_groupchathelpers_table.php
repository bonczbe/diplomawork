<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::create('groupchathelpers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('userID');
            $table->unsignedBigInteger('groupChatID');
            $table->integer('role'); // 1 user, 2 admin, 3 owner, 4 blocked
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
        Schema::dropIfExists('groupchathelpers');
    }
};
