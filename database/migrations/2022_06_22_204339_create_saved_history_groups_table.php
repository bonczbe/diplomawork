<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * I'm creating a table called saved_history_groups, which has a name, an actualProfilePicID, and
     * an owner. The actualProfilePicID and owner are both foreign keys, and they both reference the id
     * column of the profile_pics and users tables, respectively.
     */
    public function up()
    {
        Schema::create('saved_history_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name',32);
            $table->unsignedBigInteger('actualProfilePicID')->default(1);
            $table->unsignedBigInteger('owner');
            $table->foreign('owner')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('actualProfilePicID')->references('id')->on('profile_pics');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('saved_history_groups');
    }
};
