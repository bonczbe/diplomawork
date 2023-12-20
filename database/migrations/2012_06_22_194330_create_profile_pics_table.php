<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * It creates a table called profile_pics with the columns outsideID, profilePicURI, place, and
     * date.
     */
    public function up()
    {
        Schema::create('profile_pics', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('outsideID');
            $table->string('profilePicURI')->unique();
            $table->string('place');
            $table->dateTime('date');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('profile_pics');
    }
};
