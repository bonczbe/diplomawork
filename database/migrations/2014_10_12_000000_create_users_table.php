<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * It creates a table called users with the following columns:
     * id, email, phone, email_verified_at, email_verify, newPassHash, tag, firstName, middleName,
     * lastName, description, password, birthDate, status, canSeePostsAndImages, canSeeBirthDate,
     * actualProfilePicID, actualWallPaperID, gender, pronouns, lastLoggedinDate, lastLoggedOutDate,
     * resetedPasswd, role, previousDiplom, isDark, work, school, acceptedTerms, and rememberToken.
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('phone',15)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('email_verify',512)->nullable()->unique();
            $table->string('newPassHash',512)->nullable()->unique();
            $table->string('tag',60)->unique();
            $table->string('firstName',15);
            $table->string('middleName',30)->nullable();
            $table->string('lastName',15);
            $table->string('description',50)->nullable();
            $table->string('password');
            $table->date('birthDate');
            $table->string('status')->nullable();
            $table->boolean('canSeePostsAndImages')->default(false);
            $table->boolean('canSeeBirthDate')->default(false);
            $table->unsignedBigInteger('actualProfilePicID')->default(1);
            $table->unsignedBigInteger('actualWallPaperID')->default(1);
            $table->string('gender',15)->nullable();
            $table->string('pronouns',15)->nullable();
            $table->dateTime('lastLoggedinDate')->nullable();
            $table->dateTime('lastLoggedOutDate')->nullable();
            $table->string('resetedPasswd')->nullable();
            $table->integer('role'); //future plan
            $table->boolean('previousDiplom')->default(true);
            $table->boolean('isDark')->default(false);
            $table->string('work',30)->nullable();
            $table->string('school',30)->nullable();
            $table->boolean('acceptedTerms')->default(false);
            $table->rememberToken();
            $table->foreign('actualProfilePicID')->references('id')->on('profile_pics');
            $table->foreign('actualWallPaperID')->references('id')->on('wall_papers');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
};
