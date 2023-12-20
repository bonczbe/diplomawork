<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * It creates a table called groups with the following columns:
     * id, name, status, actualProfileID, actualWallPaperID, description
     */
    public function up()
    {
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->string('name',32);
            $table->boolean('status')->default(false);//Private or public false mean private
            $table->unsignedBigInteger('actualProfileID')->default(1);
            $table->unsignedBigInteger('actualWallPaperID')->default(1);
            $table->string('description',50);
            $table->foreign('actualWallPaperID')->references('id')->on('wall_papers');
            $table->foreign('actualProfileID')->references('id')->on('profile_pics');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('groups');
    }
};
