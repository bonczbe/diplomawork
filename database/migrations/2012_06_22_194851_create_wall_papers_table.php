<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * This function creates a table called 'wall_papers' with the following columns: id, outsideID,
     * place, WallPaperPicURI, and date.
     */
    
    public function up()
    {
        Schema::create('wall_papers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('outsideID');
            $table->string('place');
            $table->string('WallPaperPicURI')->unique();
            $table->dateTime('date')->default(Carbon::now());
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('wall_papers');
    }
};
