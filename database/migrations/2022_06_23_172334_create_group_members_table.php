<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * It creates a table called group_members with a foreign key to the users table and a foreign key
     * to the groups table
     */
    public function up()
    {
        Schema::create('group_members', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('groupID');
            $table->unsignedBigInteger('memberID');
            $table->integer('rank');// 1 user, 3 admin, 4 owner, 5 asked, 6 blocked
            $table->foreign('memberID')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('groupID')->references('id')->on('groups')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('group_members');
    }
};
