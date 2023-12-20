<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    /**
     * Create a table called pages_post_images with a foreign key called postID that references the id
     * column in the pages_posts table and delete the row in pages_post_images if the row in
     * pages_posts is deleted.
     */
    public function up()
    {
        Schema::create('pages_post_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('postID');
            $table->string('imageURI',4096);
            $table->foreign('postID')->references('id')->on('pages_posts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pages_post_images');
    }
};
