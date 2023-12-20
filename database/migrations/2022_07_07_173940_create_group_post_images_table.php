<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * Create a table called group_post_images with a foreign key called postID that references the id
     * column of the group_posts table and delete the row in the group_post_images table if the row in
     * the group_posts table is deleted.
     */
    public function up()
    {
        Schema::create('group_post_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('postID');
            $table->string('imageURI',4096);
            $table->foreign('postID')->references('id')->on('group_posts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('group_post_images');
    }
};
